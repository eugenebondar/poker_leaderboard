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
  boughtChips: number;
  leftChips: number;
};

type GameEntryWithDate = GameEntry & { gameDate: string };

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
              <th className="px-4 py-2 border-b border-zinc-700">Total Profit</th>
              <th className="px-4 py-2 border-b border-zinc-700">Win Rate</th>
              <th className="px-4 py-2 border-b border-zinc-700">Highest Score</th>
              <th className="px-4 py-2 border-b border-zinc-700">Most Chips Won</th>
              <th className="px-4 py-2 border-b border-zinc-700">Last Game</th>
            </tr>
          </thead>
          <tbody>
            {players
              .map(player => {
                // Find all entries for this player
                const playerEntries: GameEntryWithDate[] = [];
                games.forEach(game => {
                  game.entries.forEach(entry => {
                    if (entry.playerId === player._id) {
                      playerEntries.push({ ...entry, gameDate: game.date });
                    }
                  });
                });
                const totalPoints = playerEntries.reduce((sum, e) => sum + (e.points ?? 0), 0);
                const gamesPlayed = playerEntries.length;
                const avgPoints = gamesPlayed ? (totalPoints / gamesPlayed).toFixed(2) : '0.00';
                // Find last game
                const lastGameObj = games
                  .filter(g => g.entries.some(e => e.playerId === player._id))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const lastGame = lastGameObj ? new Date(lastGameObj.date).toLocaleDateString() : 'N/A';
                // Total Profit (chips)
                const totalProfit = playerEntries.reduce((sum, e) => sum + ((e.leftChips ?? 0) - (e.boughtChips ?? 0)), 0);
                // Win Rate (games with positive points)
                const gamesWon = playerEntries.filter(e => (e.points ?? 0) > 0).length;
                const winRate = gamesPlayed ? ((gamesWon / gamesPlayed) * 100).toFixed(1) + '%' : '0%';
                // Highest Single Game Score
                const highestScore = playerEntries.length ? Math.max(...playerEntries.map(e => e.points ?? 0)) : 0;
                // Most Chips Won in a Game
                const mostChipsWon = playerEntries.length ? Math.max(...playerEntries.map(e => (e.leftChips ?? 0) - (e.boughtChips ?? 0))) : 0;
                return {
                  ...player,
                  totalPoints,
                  gamesPlayed,
                  avgPoints,
                  lastGame,
                  totalProfit,
                  winRate,
                  highestScore,
                  mostChipsWon,
                };
              })
              .sort((a, b) => b.totalPoints - a.totalPoints)
              .map((player, idx) => (
                <tr
                  key={player._id}
                  className={
                    idx === 0
                      ? 'bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 text-yellow-900 font-bold'
                      : idx === 1
                      ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 text-gray-900 font-bold'
                      : idx === 2
                      ? 'bg-gradient-to-r from-orange-300 via-orange-200 to-orange-100 text-orange-900 font-bold'
                      : idx % 2 === 0
                      ? 'bg-zinc-900'
                      : 'bg-black'
                  }
                >
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">
                    {idx + 1}
                    {idx === 0 && <span title="Gold" className="ml-2 text-yellow-400 text-xl">🏆</span>}
                    {idx === 1 && <span title="Silver" className="ml-2 text-gray-300 text-xl">🥈</span>}
                    {idx === 2 && <span title="Bronze" className="ml-2 text-orange-400 text-xl">🥉</span>}
                  </td>
                  <td className="px-4 py-2 border-b border-zinc-700 font-semibold">{player.name}</td>
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">{player.gamesPlayed}</td>
                  <td className={"px-4 py-2 border-b border-zinc-700 text-center " + (player.totalPoints > 0 ? "text-green-500" : player.totalPoints < 0 ? "text-red-500" : "")}>{player.totalPoints}</td>
                  <td className={"px-4 py-2 border-b border-zinc-700 text-center " + (Number(player.avgPoints) > 0 ? "text-green-500" : Number(player.avgPoints) < 0 ? "text-red-500" : "")}>{player.avgPoints}</td>
                  <td className={"px-4 py-2 border-b border-zinc-700 text-center " + (player.totalProfit > 0 ? "text-green-500" : player.totalProfit < 0 ? "text-red-500" : "")}>{player.totalProfit}</td>
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">{player.winRate}</td>
                  <td className={"px-4 py-2 border-b border-zinc-700 text-center " + (player.highestScore > 0 ? "text-green-500" : player.highestScore < 0 ? "text-red-500" : "")}>{player.highestScore}</td>
                  <td className={"px-4 py-2 border-b border-zinc-700 text-center " + (player.mostChipsWon > 0 ? "text-green-500" : player.mostChipsWon < 0 ? "text-red-500" : "")}>{player.mostChipsWon}</td>
                  <td className="px-4 py-2 border-b border-zinc-700 text-center">{player.lastGame}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-center text-gray-500">Leaderboard updates automatically as games are added.</p>
    </div>
  );
}

export default LeaderboardPage;