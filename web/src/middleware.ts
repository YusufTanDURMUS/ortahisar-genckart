import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Read cookies for RBAC
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('user_role')?.value;
  const { pathname } = req.nextUrl;

  // 1. Admin rotaları koruması (Login hariç)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (role !== 'ADMIN') {
      // Esnaf admin paneline girmeye çalışırsa kendi paneline yönlendir
      if (role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/esnaf', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 2. Esnaf rotaları koruması (Login hariç)
  if (pathname.startsWith('/esnaf') && !pathname.startsWith('/esnaf/login')) {
    if (!token) {
      return NextResponse.redirect(new URL('/esnaf/login', req.url));
    }
    // Esnaf panelini sadece Esnaf ve Admin görebilir
    if (role !== 'MERCHANT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Kullanıcı zaten giriş yapmışsa ve login sayfalarına gidiyorsa, onları panellerine yönlendir
  if (token && (pathname === '/admin/login' || pathname === '/esnaf/login')) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    } else if (role === 'MERCHANT') {
      return NextResponse.redirect(new URL('/esnaf', req.url));
    }
  }

  return NextResponse.next();
}

// Hangi rotalarda çalışacağını belirt
export const config = {
  matcher: ['/admin/:path*', '/esnaf/:path*'],
};
