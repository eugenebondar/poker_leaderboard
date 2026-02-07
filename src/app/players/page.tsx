"use client";
import { useEffect, useState } from 'react';


type Player = {
  _id: string;
  name: string;
  totalPoints: number;
};

type GameEntry = {
  playerId: string;
  boughtChips: number;
  leftChips: number;
};

export default function PlayersPage() {
    // Filters and sorting state
    const [filterName, setFilterName] = useState<string>("");
    const [sortField, setSortField] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
  // All hooks at top level
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<string>("");
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [editSuccess, setEditSuccess] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccess, setDeleteSuccess] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const playersRes = await fetch('/api/players');
      const entriesRes = await fetch('/api/game-entries');
      const playersData: Player[] = playersRes.ok ? await playersRes.json() : [];
      const entriesData: GameEntry[] = entriesRes.ok ? await entriesRes.json() : [];
      setPlayers(playersData);
      setEntries(entriesData);
      setLoading(false);
    }
    async function checkAdmin() {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    }
    fetchData();
    checkAdmin();
  }, []);

  // Calculate profit for each player
  const getProfit = (playerId: string): number => {
    const playerEntries = entries.filter(e => e.playerId === playerId);
    const totalBought = playerEntries.reduce((sum, e) => sum + e.boughtChips, 0);
    const totalLeft = playerEntries.reduce((sum, e) => sum + e.leftChips, 0);
    return totalLeft - totalBought;
  };

  // Filter and sort players
  let filteredPlayers = players;
  if (filterName) {
    filteredPlayers = filteredPlayers.filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()));
  }
  filteredPlayers = [...filteredPlayers].sort((a, b) => {
    let aVal: unknown;
    let bVal: unknown;
    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'totalPoints':
        aVal = a.totalPoints ?? 0;
        bVal = b.totalPoints ?? 0;
        break;
      case 'profit':
        aVal = getProfit(a._id);
        bVal = getProfit(b._id);
        break;
      default:
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  // Add player handler
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!newPlayerName.trim()) {
      setAddError("Player name is required.");
      return;
    }
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      });
      if (!res.ok) {
        setAddError('Failed to add player.');
        return;
      }
      setAddSuccess("Player added successfully.");
      setNewPlayerName("");
      // Refresh player list
      const playersRes = await fetch('/api/players');
      const playersData: Player[] = await playersRes.json();
      setPlayers(playersData);
    } catch {
      setAddError("Failed to add player.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading players...</div>;
  }

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    if (!editPlayerName.trim()) {
      setEditError("Player name is required.");
      return;
    }
    try {
      const res = await fetch(`/api/players/${editPlayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editPlayerName.trim() }),
      });
      if (!res.ok) {
        setEditError('Failed to edit player.');
        return;
      }
      setEditSuccess("Player updated successfully.");
      setEditPlayerId(null);
      setEditPlayerName("");
      // Refresh player list
      const playersRes = await fetch('/api/players');
      const playersData: Player[] = await playersRes.json();
      setPlayers(playersData);
    } catch {
      setEditError("Failed to edit player.");
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setDeleteError('Failed to delete player.');
        return;
      }
      setDeleteSuccess("Player deleted successfully.");
      setDeleteConfirmId(null);
      // Refresh player list
      const playersRes = await fetch('/api/players');
      const playersData: Player[] = await playersRes.json();
      setPlayers(playersData);
    } catch {
      setDeleteError("Failed to delete player.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Players</h1>
      {/* Filter and sort controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center items-center">
        <input
          type="text"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          placeholder="Filter by name"
          className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
      {isAdmin && (
        <form className="mb-8 flex items-center gap-4 justify-center" onSubmit={handleAddPlayer}>
          <input
            type="text"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Player
          </button>
          {addError && <span className="text-red-500 ml-4">{addError}</span>}
          {addSuccess && <span className="text-green-500 ml-4">{addSuccess}</span>}
        </form>
      )}
      {editError && <div className="text-red-500 text-center mb-2">{editError}</div>}
      {editSuccess && <div className="text-green-500 text-center mb-2">{editSuccess}</div>}
      {deleteError && <div className="text-red-500 text-center mb-2">{deleteError}</div>}
      {deleteSuccess && <div className="text-green-500 text-center mb-2">{deleteSuccess}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black text-white border border-zinc-700 rounded shadow">
          <thead>
            <tr>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('name');
                    setSortOrder('asc');
                  }
                }}
              >
                Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'totalPoints') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('totalPoints');
                    setSortOrder('desc');
                  }
                }}
              >
                Total Points {sortField === 'totalPoints' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="px-4 py-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800"
                onClick={() => {
                  if (sortField === 'profit') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('profit');
                    setSortOrder('desc');
                  }
                }}
              >
                Profit {sortField === 'profit' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              {isAdmin && <th className="px-4 py-2 border-b border-zinc-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player: Player, idx: number) => (
              <tr key={player._id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}>
                <td className="px-4 py-2 border-b border-zinc-700 font-semibold">
                  {editPlayerId === player._id ? (
                    <form onSubmit={handleEditPlayer} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editPlayerName}
                        onChange={e => setEditPlayerName(e.target.value)}
                        className="px-2 py-1 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                      />
                      <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">Save</button>
                      <button type="button" className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={() => setEditPlayerId(null)}>Cancel</button>
                    </form>
                  ) : (
                    player.name
                  )}
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{player.totalPoints}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{getProfit(player._id)}</td>
                {isAdmin && (
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">
                    {editPlayerId !== player._id && (
                      <>
                        <button
                          className="mr-2 px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                          onClick={() => {
                            setEditPlayerId(player._id);
                            setEditPlayerName(player.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          onClick={() => setDeleteConfirmId(player._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {deleteConfirmId === player._id && (
                      <div className="flex flex-col items-center">
                        <span className="mb-2 text-sm">Are you sure you want to delete this player?</span>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            onClick={() => handleDeletePlayer(player._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
