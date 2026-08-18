import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('user_role')?.value;
  const { pathname } = req.nextUrl;

  // 1. Admin & Moderatör Paneli Koruması (Login hariç)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!token || (role !== 'ADMIN' && role !== 'MODERATOR')) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // 2. Esnaf Paneli Koruması (Login hariç)
  if (pathname.startsWith('/esnaf') && !pathname.startsWith('/esnaf/login')) {
    if (!token || role !== 'MERCHANT') {
      return NextResponse.redirect(new URL('/esnaf/login', req.url));
    }
  }

  // 3. Login Sayfaları Yönlendirmesi (Sadece kendi rolündeki aktif oturumu olanlar paneline yönlendirilsin)
  if (token) {
    // Admin login'e sadece aktif ADMIN veya MODERATOR oturumu olan yönlensin
    if (pathname === '/admin/login' && (role === 'ADMIN' || role === 'MODERATOR')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    // Esnaf login'e sadece aktif MERCHANT oturumu olan yönlensin
    if (pathname === '/esnaf/login' && role === 'MERCHANT') {
      return NextResponse.redirect(new URL('/esnaf', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/esnaf/:path*'],
};
