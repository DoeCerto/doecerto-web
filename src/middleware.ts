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

    const publicPaths = [
        '/',
        '/home',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/splash',
        '/terms',
        '/privacy',
        '/help-center',
        '/ong-public-profile',
        '/donate',
        '/categories-guide',
        '/donation-guide',
        '/donation-history-guide',
        '/donation-item-guide',
        '/rating-guide',
        '/pix'
    ];

    // Verifica se a rota atual está na whitelist de rotas públicas
    const isPublicRoute = publicPaths.some(path => 
        path === '/' ? pathname === '/' : pathname.startsWith(path)
    );

    // No Padrão Ouro (Zero Trust), se não é pública, é protegida por padrão!
    const isProtected = !isPublicRoute;

    // isOngPrivateRoute continua existindo apenas para regras específicas de redirecionamento de role
    const isOngPrivateRoute = 
        pathname === '/ong' || 
        pathname.startsWith('/ong/') || 
        pathname.startsWith('/ong-dashboard') ||
        pathname.startsWith('/ong-profilesetup');

    let response = NextResponse.next();

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        // Junta o caminho (/donation) com os parâmetros da URL (?ongId=...)
        const fullPath = `${pathname}${request.nextUrl.search}`;
        loginUrl.searchParams.set('from', fullPath);
        response = NextResponse.redirect(loginUrl);
    } else if (token) {
        if (isOngPrivateRoute && userRole !== 'ong' && userRole !== 'admin') {
            response = NextResponse.redirect(new URL('/dashboard', request.url));
        } else if ((pathname.startsWith('/admin') || pathname.startsWith('/adm-dashboard')) && userRole !== 'admin') {
            response = NextResponse.redirect(new URL('/', request.url));
        } else if (pathname.startsWith('/dashboard') && userRole === 'ong') {
            response = NextResponse.redirect(new URL('/ong-dashboard', request.url));
        } else if ((pathname === '/' || pathname.startsWith('/home')) && userRole === 'ong') {
            response = NextResponse.redirect(new URL('/ong-dashboard', request.url));
        }
    }

    const authPaths = ['/login', '/register'];
    if (authPaths.some((path) => pathname.startsWith(path)) && token) {
        const defaultRedirect = userRole === 'ong' ? '/ong-dashboard' : (userRole === 'admin' ? '/adm-dashboard' : '/dashboard');
        response = NextResponse.redirect(new URL(defaultRedirect, request.url));
    }

    // Prevenir que páginas protegidas sejam guardadas no cache do navegador (BFCache)
    if (isProtected || authPaths.some(path => pathname.startsWith(path))) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};