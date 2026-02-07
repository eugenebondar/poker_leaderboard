import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: `Invalid credentials ${email} ${ADMIN_EMAIL}` }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    return NextResponse.json({ error: `Invalid credentials ${password} ${ADMIN_PASSWORD_HASH} ${ADMIN_PASSWORD_HASH.length}` }, { status: 401 });
  }

  // Set session cookie
  // Note: Next.js API Route handlers don't have direct access to response objects for iron-session
  // For App Router, use cookies API
  // Here, we return a success response; session logic will be handled in pages/api or middleware
  return NextResponse.json({ success: true, isAdmin: true });
}
