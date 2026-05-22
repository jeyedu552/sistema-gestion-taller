import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para el control de acceso y redirecciones.
 * Implementa HU-01 - Autenticación y control de acceso por roles.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // 1. Si el usuario intenta acceder al login o registro y ya tiene sesión, redirigirlo a su panel
  if (sessionCookie && (pathname.startsWith('/autenticacion/inicio-sesion') || pathname === '/')) {
    try {
      if (sessionCookie.value) {
        const session = JSON.parse(sessionCookie.value);
        const role = session.role;

        if (role === 'ADMIN') {
          return NextResponse.redirect(new URL('/administrador', request.url));
        } else if (role === 'MECANICO') {
          return NextResponse.redirect(new URL('/mecanico', request.url));
        } else if (role === 'CLIENTE') {
          return NextResponse.redirect(new URL('/cliente', request.url));
        }
      }
    } catch (e) {
      console.error('Error parsing session cookie:', e);
      // Si la cookie es inválida, dejar que continúe
    }
  }

  // 2. Proteger rutas basadas en roles
  const protectedRoutes = ['/administrador', '/mecanico', '/cliente'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL('/autenticacion/inicio-sesion', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      const role = session.role;

      // Validar si el rol tiene acceso a la ruta solicitada
      if (pathname.startsWith('/administrador') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/mecanico') && role !== 'MECANICO') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/cliente') && role !== 'CLIENTE') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (e) {
      console.error('Error parsing session cookie in protected route:', e);
      return NextResponse.redirect(new URL('/autenticacion/inicio-sesion', request.url));
    }
  }

  return NextResponse.next();
}

// Configuración de rutas que el proxy debe procesar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
