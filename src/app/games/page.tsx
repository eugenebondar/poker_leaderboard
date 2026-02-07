"use client";
import { useEffect, useState } from 'react';

type Game = {
  _id: string;
  date: string;
  entries: { playerId: string; points: number }[];
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newGameDate, setNewGameDate] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<string>("");

  useEffect(() => {
    async function fetchGames() {
      const res = await fetch('/api/games');
      const data: Game[] = res.ok ? await res.json() : [];
      setGames(data);
      setLoading(false);
    }
    async function checkAdmin() {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    }
    fetchGames();
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
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newGameDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.error || 'Failed to add game.');
        return;
      }
      setAddSuccess("Game added successfully.");
      setNewGameDate("");
      // Refresh games list
      const gamesRes = await fetch('/api/games');
      const gamesData: Game[] = gamesRes.ok ? await gamesRes.json() : [];
      setGames(gamesData);
    } catch (err) {
      setAddError("Failed to add game.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Games</h1>
      {isAdmin && (
        <form className="mb-8 flex items-center gap-4 justify-center" onSubmit={handleAddGame}>
          <input
            type="date"
            value={newGameDate}
            onChange={e => setNewGameDate(e.target.value)}
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
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
              <th className="px-4 py-2 border-b border-zinc-700">Date</th>
              <th className="px-4 py-2 border-b border-zinc-700">Players</th>
              <th className="px-4 py-2 border-b border-zinc-700">Entries</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game: Game, idx: number) => (
              <tr key={game._id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{new Date(game.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">{game.entries.length}</td>
                <td className="px-4 py-2 border-b border-zinc-700 text-center">
                  {game.entries.map(e => `${e.playerId}: ${e.points}`).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
