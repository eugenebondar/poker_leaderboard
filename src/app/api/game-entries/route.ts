import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import GameEntry from '@/models/GameEntry';

export async function GET() {
  await connectToDatabase();
  const entries = await GameEntry.find().lean();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const data = await request.json();
  const entry = await GameEntry.create(data);
  return NextResponse.json(entry, { status: 201 });
}
