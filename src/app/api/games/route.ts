import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function GET() {
  await connectToDatabase();
  const games = await Game.find().lean();
  return NextResponse.json(games);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const data = await request.json();
  const game = await Game.create(data);
  return NextResponse.json(game, { status: 201 });
}
