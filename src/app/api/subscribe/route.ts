import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import crypto from 'crypto';

export async function POST(request: Request) {
  await connectToDatabase();
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const unsubscribeToken = crypto.randomBytes(16).toString('hex');
  const subscriber = await Subscriber.create({ email, unsubscribeToken });
  return NextResponse.json(subscriber, { status: 201 });
}
