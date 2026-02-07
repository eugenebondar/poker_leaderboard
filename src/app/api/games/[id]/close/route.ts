import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const game = await Game.findByIdAndUpdate(
    params.id,
    { status: 'CLOSED', closedAt: new Date() },
    { new: true }
  ).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}
