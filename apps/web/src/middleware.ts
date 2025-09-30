import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/terms-service",
  "/privacy-policies",
  "/auth/success",
  "/auth/social-callback",
  "/social-callback",
  "/callback",
  "/test",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Temporariamente desabilitar middleware para páginas de callback
  if (
    pathname.includes("callback") ||
    pathname === "/test" ||
    pathname.includes("/auth/success")
  ) {
    console.log(
      "Middleware: Permitindo acesso à página de callback/teste/sucesso:",
      pathname
    );
    return NextResponse.next();
  }

  // Verificar se está em uma rota pública
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se usuário não está autenticado e a rota não é pública, redireciona para o login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se usuário está autenticado e tenta acessar uma rota pública, redireciona para o dashboard
  // EXCETO para páginas de callback que precisam processar tokens
  if (
    token &&
    isPublicRoute &&
    !pathname.includes("callback") &&
    !pathname.includes("/auth/success")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
