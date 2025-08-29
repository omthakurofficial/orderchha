import { NextResponse, NextRequest } from 'next/server';

// Define the paths that are public and don't require authentication
const publicPaths = [
  '/login',
  '/receipt', // Allow public access to receipts
  '/api/', // API routes are handled separately
];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For client-side protection, we'll rely on the AuthLayout component
  // This middleware is just an extra layer of security
  
  return NextResponse.next();
}

// Configure the paths that this middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
