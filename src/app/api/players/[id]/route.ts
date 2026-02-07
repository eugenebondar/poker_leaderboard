import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Player from '@/models/Player';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const player = await Player.findById(params.id).lean();
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  return NextResponse.json(player);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const data = await request.json();
  const player = await Player.findByIdAndUpdate(params.id, data, { new: true }).lean();
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  return NextResponse.json(player);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectToDatabase();
  const player = await Player.findByIdAndDelete(params.id).lean();
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
