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
    fetchData();
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Players</h1>
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
