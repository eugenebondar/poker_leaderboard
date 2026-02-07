import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Game from '@/models/Game';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const game = await Game.findById(params.id).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const data = await request.json();
  const game = await Game.findByIdAndUpdate(params.id, data, { new: true }).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const game = await Game.findByIdAndDelete(params.id).lean();
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
