import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/terms-service',
  '/privacy-policies',
  '/auth/success',
  '/auth/social-callback',
  '/social-callback',
  '/callback',
  '/test'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Verificar se está em uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Se usuário não está autenticado e a rota não é pública, redireciona para o login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se usuário está autenticado e tenta acessar uma rota pública, redireciona para o dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};