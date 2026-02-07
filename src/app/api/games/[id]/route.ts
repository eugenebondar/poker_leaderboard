import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = await params;
  const game = await Game.findById(id).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = await params;
  const data = await request.json();
  const game = await Game.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = await params;
  const game = await Game.findByIdAndDelete(id).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
