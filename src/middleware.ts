import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect /api/admin routes except /api/admin/login
  if (
    request.nextUrl.pathname.startsWith('/api/admin') &&
    request.nextUrl.pathname !== '/api/admin/login'
  ) {
    const cookie = request.cookies.get('admin_session');
    // Simple check: cookie exists (for full session validation, use iron-session logic)
    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
