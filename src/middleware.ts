import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Definujeme cesty, které jsou VEŘEJNÉ (kam se smí bez přihlášení)
    // Musíme povolit login, register a statické soubory (obrázky, api auth)
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') || // Interní věci Next.js
        pathname === '/' // Úvodní stránka (pokud ji chceš nechat veřejnou)
    ) {
        return NextResponse.next();
    }

    // 2. Pokud uživatel NEMÁ token a chce jít jinam, pošli ho na login
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// 3. Konfigurace: Na které cesty se má middleware vztahovat
export const config = {
    matcher: [
        /*
         * Zachytí všechny cesty kromě těch, co začínají na:
         * - api (pokud nechceš blokovat i API, ale my chceme auth API nechat)
         * - _next/static (statické soubory)
         * - _next/image (optimalizace obrázků)
         * - favicon.ico (ikona)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};