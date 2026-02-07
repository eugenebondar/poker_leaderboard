import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Player from '@/models/Player';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const player = await Player.findById(params.id).lean();
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  return NextResponse.json(player);
}
