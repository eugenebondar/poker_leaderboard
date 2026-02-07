import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Player from '@/models/Player';

export async function GET() {
  await connectToDatabase();
  const players = await Player.find().lean();
  return NextResponse.json(players);
}
