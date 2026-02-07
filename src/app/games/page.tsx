"use client";
import { useEffect, useState } from 'react';

type Game = {
  _id: string;
  date: string;
  bankCost?: number;
  status?: 'OPEN' | 'CLOSED';
  entries: { playerId: string; playerName: string; points: number; boughtChips?: number; leftChips?: number }[];
};

type Player = {
  _id: string;
  name: string;
};

export default function GamesPage() {
  // Filters and sorting state
  const [filterDate, setFilterDate] = useState<string>("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newGameDate, setNewGameDate] = useState<string>("");
  const [newBankCost, setNewBankCost] = useState<string>("50");
  const [addError, setAddError] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<string>("");
  const [editGameId, setEditGameId] = useState<string | null>(null);
  const [editGameDate, setEditGameDate] = useState<string>("");
  const [editBankCost, setEditBankCost] = useState<string>("50");
  const [editStatus, setEditStatus] = useState<'OPEN' | 'CLOSED'>("OPEN");
  type EditEntry = {
    playerId: string;
    name: string;
    boughtChips: number | string;
    leftChips: number | string;
    inGame: boolean;
  };
  const [editEntries, setEditEntries] = useState<EditEntry[]>([]);
  const [editError, setEditError] = useState<string>("");
  const [editSuccess, setEditSuccess] = useState<string>("");
  const [deleteGameId, setDeleteGameId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccess, setDeleteSuccess] = useState<string>("");

  useEffect(() => {
    async function fetchGames() {
      const res = await fetch('/api/games');
      const data: Game[] = res.ok ? await res.json() : [];
      setGames(data);
      setLoading(false);
    }
    async function fetchPlayers() {
      const res = await fetch('/api/players');
      const data: Player[] = res.ok ? await res.json() : [];
      setPlayers(data);
    }
    async function checkAdmin() {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    }
    fetchGames();
    fetchPlayers();
    checkAdmin();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading games...</div>;
  }

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!newGameDate.trim()) {
      setAddError("Game date is required.");
      return;
    }
    try {
      // Use the date as the default title
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newGameDate, title: newGameDate, bankCost: Number(newBankCost) || 0 }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.error || 'Failed to add game.');
        return;
      }
      setAddSuccess("Game added successfully.");
      setNewGameDate("");
      setNewBankCost("");
      // Refresh games list
      const gamesRes = await fetch('/api/games');
      const gamesData: Game[] = gamesRes.ok ? await gamesRes.json() : [];
      setGames(gamesData);
    } catch {
      setAddError("Failed to add game.");
    }
  };

  // Filter and sort games
  let filteredGames = games;
  if (filterDate) {
    filteredGames = filteredGames.filter(g => g.date && g.date.startsWith(filterDate));
  }
  filteredGames = [...filteredGames].sort((a, b) => {
    let aVal: number | string | Date;
    let bVal: number | string | Date;
    switch (sortField) {
      case 'date':
        aVal = new Date(a.date);
        bVal = new Date(b.date);
        break;
      case 'bankCost':
        aVal = a.bankCost ?? 0;
        bVal = b.bankCost ?? 0;
        break;
      case 'entries':
        aVal = a.entries.length;
        bVal = b.entries.length;
        break;
      default:
        aVal = a.date;
        bVal = b.date;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Games</h1>
      {/* Filter and sort controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center items-center">
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
        />
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white"
        >
          <option value="date">Date</option>
          <option value="bankCost">Bank Cost</option>
          <option value="entries">Players</option>
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      {isAdmin && (
        <form className="mb-8 flex items-center gap-4 justify-center" onSubmit={handleAddGame}>
          <input
            type="date"
            value={newGameDate}
            onChange={e => setNewGameDate(e.target.value)}
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="0"
            placeholder="Bank Cost (₴)"
            value={newBankCost}
            onChange={e => setNewBankCost(e.target.value)}
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500 w-40"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Game
          </button>
          {addError && <span className="text-red-500 ml-4">{addError}</span>}
          {addSuccess && <span className="text-green-500 ml-4">{addSuccess}</span>}
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black text-white border border-zinc-700 rounded shadow">
          <thead>
            <tr>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'date') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('date');
                    setSortOrder('desc');
                  }
                }}
              >
                Date {sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'bankCost') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('bankCost');
                    setSortOrder('desc');
                  }
                }}
              >
                Bank Cost (₴) {sortField === 'bankCost' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'entries') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('entries');
                    setSortOrder('desc');
                  }
                }}
              >
                Players {sortField === 'entries' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-4 py-2 border-b border-zinc-700">Status</th>
              <th className="px-4 py-2 border-b border-zinc-700">Entries</th>
              {isAdmin && <th className="px-4 py-2 border-b border-zinc-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game: Game, idx: number) => (
              <tr key={game._id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{new Date(game.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{game.bankCost ?? 0}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{game.entries.length}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">
                  <span
                    className={
                      "inline-block px-3 py-1 rounded-full text-xs font-semibold " +
                      (game.status === 'CLOSED'
                        ? 'bg-green-700 text-white border border-green-900'
                        : 'bg-gray-600 text-white border border-gray-800')
                    }
                  >
                    {game.status ?? 'OPEN'}
                  </span>
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">
                  {game.entries.map((e) => {
                    // Calculate money balance for each player
                    const chipsDiff = (typeof e.leftChips === 'number' ? e.leftChips : 0) - (typeof e.boughtChips === 'number' ? e.boughtChips : 0);
                    const bankCost = typeof game.bankCost === 'number' ? game.bankCost : 0;
                    let moneyBalance: string | number = '-';
                    if (bankCost && bankCost > 0) {
                      const rate = bankCost / 5000;
                      moneyBalance = Math.round(chipsDiff * rate * 100) / 100;
                    }
                    const color = typeof moneyBalance === 'number' && moneyBalance > 0 ? 'text-green-500' : typeof moneyBalance === 'number' && moneyBalance < 0 ? 'text-red-500' : 'text-white';
                    return (
                      <div key={e.playerId} className={color}>
                        {e.playerName}: {chipsDiff} chips ({moneyBalance} PLN)
                      </div>
                    );
                  })}
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">
                    <button
                      className="mr-2 px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      onClick={() => {
                        setEditGameId(game._id);
                        setEditGameDate(game.date.split('T')[0]);
                        setEditBankCost(game.bankCost?.toString() ?? "");
                        setEditStatus(game.status ?? 'OPEN');
                        setEditError("");
                        setEditSuccess("");
                        // Prepare entries for editing
                        setEditEntries(
                          players.map(player => {
                            const entry = game.entries.find(e => e.playerId === player._id) || { boughtChips: 0, leftChips: 0 };
                            return {
                              playerId: player._id,
                              name: player.name,
                              boughtChips: entry.boughtChips ?? 0,
                              leftChips: entry.leftChips ?? 0,
                              inGame: !!game.entries.find(e => e.playerId === player._id),
                            };
                          })
                        );
                      }}
                    >Edit</button>
                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => {
                        setDeleteGameId(game._id);
                        setDeleteError("");
                        setDeleteSuccess("");
                      }}
                    >Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Game Modal */}
      {editGameId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-zinc-900 p-6 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Game</h2>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setEditError("");
                setEditSuccess("");
                try {
                  // Update game date, bankCost, and status
                  const res = await fetch(`/api/games/${editGameId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: new Date(editGameDate).toISOString(), bankCost: Number(editBankCost) || 0, status: editStatus }),
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    setEditError(err.error || "Failed to update game.");
                    return;
                  }
                  // Update entries
                  const filteredEntries = editEntries.filter(e => e.inGame);
                  const entriesRes = await fetch(`/api/games/${editGameId}/entries`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(filteredEntries.map(e => ({
                      playerId: e.playerId,
                      boughtChips: Number(e.boughtChips) || 0,
                      leftChips: Number(e.leftChips) || 0,
                    }))),
                  });
                  if (!entriesRes.ok) {
                    const err = await entriesRes.json();
                    setEditError(err.error || "Failed to update entries.");
                    return;
                  }
                  setEditSuccess("Game updated.");
                  setEditGameId(null);
                  // Refresh games
                  const gamesRes = await fetch('/api/games');
                  const gamesData: Game[] = gamesRes.ok ? await gamesRes.json() : [];
                  setGames(gamesData);
                } catch {
                  setEditError("Failed to update game.");
                }
              }}
            >
              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={editGameDate}
                  onChange={e => setEditGameDate(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Bank Cost (₴)"
                  value={editBankCost}
                  onChange={e => setEditBankCost(e.target.value)}
                  className="w-40 px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white"
                />
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as 'OPEN' | 'CLOSED')}
                  className="w-40 px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full bg-zinc-800 text-white border border-zinc-700 rounded">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border-b border-zinc-700">In Game</th>
                      <th className="px-2 py-1 border-b border-zinc-700">Player</th>
                      <th className="px-2 py-1 border-b border-zinc-700">Bought Chips</th>
                      <th className="px-2 py-1 border-b border-zinc-700">Left Chips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editEntries.map((entry, idx) => (
                      <tr key={entry.playerId} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800'}>
                        <td className="px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={entry.inGame}
                            onChange={e => {
                              const updated = [...editEntries];
                              updated[idx].inGame = e.target.checked;
                              setEditEntries(updated);
                            }}
                          />
                        </td>
                        <td className="px-2 py-1">{entry.name}</td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            value={entry.boughtChips}
                            disabled={!entry.inGame}
                            onChange={e => {
                              const updated = [...editEntries];
                              updated[idx].boughtChips = e.target.value;
                              setEditEntries(updated);
                            }}
                            className="w-20 px-2 py-1 rounded border border-zinc-700 bg-zinc-900 text-white"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            value={entry.leftChips}
                            disabled={!entry.inGame}
                            onChange={e => {
                              const updated = [...editEntries];
                              updated[idx].leftChips = e.target.value;
                              setEditEntries(updated);
                            }}
                            className="w-20 px-2 py-1 rounded border border-zinc-700 bg-zinc-900 text-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-zinc-700 text-white rounded"
                  onClick={() => setEditGameId(null)}
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >Save</button>
              </div>
              {editError && <div className="text-red-500 mt-2">{editError}</div>}
              {editSuccess && <div className="text-green-500 mt-2">{editSuccess}</div>}
            </form>
          </div>
        </div>
      )}
      {/* Delete Game Modal */}
      {deleteGameId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-zinc-900 p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete Game</h2>
            <p className="mb-4">Are you sure you want to delete this game? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-zinc-700 text-white rounded"
                onClick={() => setDeleteGameId(null)}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  setDeleteError("");
                  setDeleteSuccess("");
                  try {
                    const res = await fetch(`/api/games/${deleteGameId}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      setDeleteError(err.error || "Failed to delete game.");
                      return;
                    }
                    setDeleteSuccess("Game deleted.");
                    setDeleteGameId(null);
                    // Refresh games
                    const gamesRes = await fetch('/api/games');
                    const gamesData: Game[] = gamesRes.ok ? await gamesRes.json() : [];
                    setGames(gamesData);
                  } catch {
                    setDeleteError("Failed to delete game.");
                  }
                }}
              >Delete</button>
            </div>
            {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
            {deleteSuccess && <div className="text-green-500 mt-2">{deleteSuccess}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
