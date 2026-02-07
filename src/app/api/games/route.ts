import { NextResponse } from 'next/server';

// Mocked games data
const games = [
  { id: '1', title: 'Friday Night #1', date: '2026-02-01', status: 'CLOSED' },
  { id: '2', title: 'Friday Night #2', date: '2026-02-07', status: 'OPEN' },
];

export async function GET() {
  return NextResponse.json(games);
}
