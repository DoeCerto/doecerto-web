import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getUserRoleFromToken(token: string): string | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(base64);
        const decoded = JSON.parse(decodedJson);
        return decoded.role || null;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;
    const userRole = token ? getUserRoleFromToken(token) : null;

    const isOngPrivateRoute = pathname === '/ong' || pathname.startsWith('/ong/');

    const protectedPaths = ['/dashboard', '/admin', '/settings', '/donation'];
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path)) || isOngPrivateRoute;

    if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    // Junta o caminho (/donation) com os parâmetros da URL (?ongId=...)
    const fullPath = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('from', fullPath);
    return NextResponse.redirect(loginUrl);
  }
    if (token) {
        if (isOngPrivateRoute && userRole !== 'ong' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    const authPaths = ['/login', '/register'];
    if (authPaths.some((path) => pathname.startsWith(path)) && token) {
        const defaultRedirect = userRole === 'ong' ? '/ong/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(defaultRedirect, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
};