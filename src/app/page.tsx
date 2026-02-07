"use client";
import { useEffect, useState } from 'react';

type Player = {
  _id: string;
  name: string;
  totalPoints: number;
};

type GameEntry = {
  playerId: string;
  points: number;
};

type Game = {
  _id: string;
  date: string;
  entries: GameEntry[];
};

const LeaderboardPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const playersRes = await fetch('/api/players');
      const gamesRes = await fetch('/api/games');
      const playersData: Player[] = playersRes.ok ? await playersRes.json() : [];
      const gamesData: Game[] = gamesRes.ok ? await gamesRes.json() : [];
      setPlayers(playersData);
      setGames(gamesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading leaderboard...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Poker Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black text-white border border-zinc-700 rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b border-zinc-700">Rank</th>
              <th className="px-4 py-2 border-b border-zinc-700">Player</th>
              <th className="px-4 py-2 border-b border-zinc-700">Games Played</th>
              <th className="px-4 py-2 border-b border-zinc-700">Total Points</th>
              <th className="px-4 py-2 border-b border-zinc-700">Average Points</th>
              <th className="px-4 py-2 border-b border-zinc-700">Last Game</th>
            </tr>
          </thead>
          <tbody>
            {players
              .sort((a, b) => b.totalPoints - a.totalPoints)
              .map((player: Player, idx: number) => {
                const playerGames = games.filter((g: Game) => g.entries.some((e: GameEntry) => e.playerId === player._id));
                const totalPoints = player.totalPoints || 0;
                const avgPoints = playerGames.length ? (totalPoints / playerGames.length).toFixed(2) : '0.00';
                const lastGame = playerGames.length ? new Date(playerGames[playerGames.length - 1].date).toLocaleDateString() : 'N/A';
                return (
                  <tr key={player._id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-black'}>
                    <td className="px-4 py-2 border-b border-zinc-700 text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border-b border-zinc-700 font-semibold">{player.name}</td>
                    <td className="px-4 py-2 border-b border-zinc-700 text-center">{playerGames.length}</td>
                    <td className="px-4 py-2 border-b border-zinc-700 text-center">{totalPoints}</td>
                    <td className="px-4 py-2 border-b border-zinc-700 text-center">{avgPoints}</td>
                    <td className="px-4 py-2 border-b border-zinc-700 text-center">{lastGame}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-center text-gray-500">Leaderboard updates automatically as games are added.</p>
    </div>
  );
}

export default LeaderboardPage;