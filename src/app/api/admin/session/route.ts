import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check for admin_session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const isAdmin = cookieHeader.includes('admin_session=true');
  return NextResponse.json({ isAdmin });
}
