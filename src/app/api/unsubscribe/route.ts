import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Subscriber from '@/models/Subscriber';

export async function POST(request: Request) {
  await connectToDatabase();
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }
  const subscriber = await Subscriber.findOneAndDelete({ unsubscribeToken: token });
  if (!subscriber) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
