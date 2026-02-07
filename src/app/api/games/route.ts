import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function GET() {
  await connectToDatabase();
  // Get all games
  const games = await Game.find().lean();
  // Get all entries
  const GameEntry = (await import('@/models/GameEntry')).default;
  const entries = await GameEntry.find().lean();
  // Build a playerId -> name map
  const Player = (await import('@/models/Player')).default;
  const playerDocs = await Player.find().lean();
  const playerMap = new Map(playerDocs.map((p: any) => [p._id.toString(), p.name]));

  // Attach entries to each game, including player name
  const gamesWithEntries = games.map(game => {
    const gameId = (game._id as any)?.toString?.() ?? String(game._id);
    return {
      _id: game._id,
      date: game.date,
      bankCost: game.bankCost,
      title: game.title,
      status: game.status,
      createdAt: game.createdAt,
      closedAt: game.closedAt,
      entries: entries
        .filter(e => e.gameId && e.gameId.toString() === gameId)
        .map(e => ({
          playerId: e.playerId.toString(),
          playerName: playerMap.get(e.playerId.toString()) || '',
          points: (e.leftChips ?? 0) - (e.boughtChips ?? 0),
          boughtChips: e.boughtChips,
          leftChips: e.leftChips,
        })),
    };
  });
  return NextResponse.json(gamesWithEntries);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const data = await request.json();
  const game = await Game.create(data);
  return NextResponse.json(game, { status: 201 });
}
