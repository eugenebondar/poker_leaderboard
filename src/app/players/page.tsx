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
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const playersRes = await fetch('/api/players');
      const entriesRes = await fetch('/api/game-entries');
      const playersData: Player[] = await playersRes.json();
      const entriesData: GameEntry[] = await entriesRes.json();
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading players...</div>;
  }

  // Calculate profit for each player
  const getProfit = (playerId: string): number => {
    const playerEntries = entries.filter(e => e.playerId === playerId);
    const totalBought = playerEntries.reduce((sum, e) => sum + e.boughtChips, 0);
    const totalLeft = playerEntries.reduce((sum, e) => sum + e.leftChips, 0);
    return totalLeft - totalBought;
  };

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
        const err = await res.json();
        setAddError(err.error || 'Failed to add player.');
        return;
      }
      setAddSuccess("Player added successfully.");
      setNewPlayerName("");
      // Refresh player list
      const playersRes = await fetch('/api/players');
      const playersData: Player[] = await playersRes.json();
      setPlayers(playersData);
    } catch (err) {
      setAddError("Failed to add player.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Players</h1>
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black text-white border border-zinc-700 rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b border-zinc-700">Name</th>
              <th className="px-4 py-2 border-b border-zinc-700">Total Points</th>
              <th className="px-4 py-2 border-b border-zinc-700">Profit</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player: Player, idx: number) => (
              <tr key={player._id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}>
                <td className="px-4 py-2 border-b border-zinc-700 font-semibold">{player.name}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{player.totalPoints}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{getProfit(player._id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
