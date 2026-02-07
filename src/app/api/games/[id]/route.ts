import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const game = await Game.findById(params.id).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}
