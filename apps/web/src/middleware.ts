import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/profile', '/checkout', '/orders', '/admin', '/seller'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Basic check for refresh token presence in cookies
  const token = request.cookies.get('refreshToken')?.value;
  const hasToken = token && token !== 'loggedout';

  if (isProtectedRoute && !hasToken) {
    // Redirect to login if accessing protected route without a token
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasToken) {
    // Redirect to dashboard if logged in and trying to access login/register
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
