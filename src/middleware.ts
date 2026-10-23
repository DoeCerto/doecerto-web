import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): { role?: string; exp?: number } | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(base64);
        return JSON.parse(decodedJson);
    } catch {
        return null;
    }
}

function getUserRoleFromToken(token: string): string | null {
    const decoded = decodeJwt(token);
    return decoded?.role || null;
}

function isTokenExpired(token: string): boolean {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    // Se expirar em menos de 10 segundos, renova antecipadamente
    return decoded.exp * 1000 <= Date.now() + 10000;
}

export async function middleware(request: NextRequest) {
    // 🛡️ CSP: Geração de nonce criptográfico único por requisição (Padrão Ouro OWASP)
    // Impede execução de qualquer script inline não-autorizado (defesa robusta contra XSS)
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const isDev = process.env.NODE_ENV === 'development';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""};
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https: ${apiUrl};
        font-src 'self' https://fonts.gstatic.com data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        connect-src 'self' ${apiUrl} https:;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    let token = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const { pathname } = request.nextUrl;

    let refreshedTokens: { accessToken: string; refreshToken: string } | null = null;

    // Padrão Ouro da Indústria (Netflix, Amazon, HBO, iFood):
    // Se o access_token expirou mas ainda temos o refresh_token de 7 dias,
    // renova a sessão de forma transparente no servidor antes de entregar a página,
    // sem redirecionar para a tela de login nem causar "piscada" na interface!
    if ((!token || isTokenExpired(token)) && refreshToken) {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `refresh_token=${refreshToken}`,
                    'x-client-type': 'server',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data.accessToken) {
                    token = data.accessToken;
                    refreshedTokens = {
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken || refreshToken,
                    };
                }
            }
        } catch (error) {
            console.error('[Middleware] Falha ao renovar token silenciosamente:', error);
        }
    }

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
        '/metodologia',
        '/help-center',
        '/ong-public-profile',
        '/donate',
        '/categories-guide',
        '/donation-guide',
        '/donation-history-guide',
        '/donation-item-guide',
        '/rating-guide',
        '/pix',
        '/donation'
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

    let response: NextResponse;

    if (refreshedTokens) {
        // Atualiza cookies no request para que Server Components tenham acesso imediato
        request.cookies.set('access_token', refreshedTokens.accessToken);
        request.cookies.set('refresh_token', refreshedTokens.refreshToken);
    }

    response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        // Junta o caminho (/donation) com os parâmetros da URL (?ongId=...)
        const fullPath = `${pathname}${request.nextUrl.search}`;
        loginUrl.searchParams.set('from', fullPath);
        response = NextResponse.redirect(loginUrl);
        // Se a sessão expirou completamente (ou seja, refresh falhou), limpa cookies residuais
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Content-Security-Policy', cspHeader);
        response.headers.set('x-nonce', nonce);
        return response;
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

    // Se houve renovação de tokens, injeta os novos cookies na response (seja ela next() ou redirect())
    if (refreshedTokens) {
        const isProd = process.env.NODE_ENV === 'production';
        response.cookies.set({
            name: 'access_token',
            value: refreshedTokens.accessToken,
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutos
        });

        response.cookies.set({
            name: 'refresh_token',
            value: refreshedTokens.refreshToken,
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 dias
        });
    }

    // Aplica cabeçalhos CSP e Nonce na resposta
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('x-nonce', nonce);

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};