import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import GameEntry from '@/models/GameEntry';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const entries = await request.json(); // Expecting array of { playerId, boughtChips, leftChips }

  // Bulk upsert entries for the game
  const bulkOps = entries.map((entry: unknown) => ({
    updateOne: {
      filter: { gameId: params.id, playerId: entry.playerId },
      update: { $set: { boughtChips: entry.boughtChips, leftChips: entry.leftChips, updatedAt: new Date() } },
      upsert: true,
    },
  }));

  await GameEntry.bulkWrite(bulkOps);
  return NextResponse.json({ success: true });
}
