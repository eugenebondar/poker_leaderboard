import { NextResponse } from 'next/server';

// Mocked leaderboard data
const leaderboard = [
  { name: 'Alice', totalBought: 1000, totalLeft: 1500, profit: 500 },
  { name: 'Bob', totalBought: 1200, totalLeft: 900, profit: -300 },
  { name: 'Charlie', totalBought: 800, totalLeft: 1100, profit: 300 },
];

export async function GET() {
  return NextResponse.json(leaderboard);
}
