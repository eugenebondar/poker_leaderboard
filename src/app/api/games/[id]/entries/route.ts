import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import GameEntry from '@/models/GameEntry';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = await params;
  const entries = await request.json(); // Expecting array of { playerId, boughtChips, leftChips }

  // Bulk upsert entries for the game
  const bulkOps = entries.map((entry: any) => ({
    updateOne: {
      filter: { gameId: id, playerId: entry.playerId },
      update: { $set: { boughtChips: entry.boughtChips, leftChips: entry.leftChips, updatedAt: new Date() } },
      upsert: true,
    },
  }));

  await GameEntry.bulkWrite(bulkOps);
  return NextResponse.json({ success: true });
}
