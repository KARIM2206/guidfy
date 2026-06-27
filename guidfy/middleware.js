import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// Protected Routes
// ─────────────────────────────────────────────
const PROTECTED_ROUTES = [
  '/admin',
  '/super-admin',
  '/profile',
  '/community',
];

// ─────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────
const PUBLIC_ROUTES = ['/login', '/register'];

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const isPublic =
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === '/';

  if (isPublic) {
    return NextResponse.next();
  }

  // Check protected routes
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // ✅ FIX: اسم الـ cookie الصح هو 'token' مش 'auth_token'
  const token = request.cookies.get('token')?.value;

  // No token → redirect login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists
  return NextResponse.next();
}

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};