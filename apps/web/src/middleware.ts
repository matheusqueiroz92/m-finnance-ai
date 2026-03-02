import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que SEMPRE podem ser acessadas sem token (permite mesmo com path variante, ex. barra final)
const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/terms-service",
  "/privacy-policies",
  "/politicas-privacidade",
  "/contact",
  "/auth/",
  "/callback",
  "/test",
];

// Rotas que EXIGEM token
const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/settings",
  "/accounts",
  "/transactions",
  "/wallet",
  "/goals",
  "/insights",
  "/reports",
  "/credit-cards",
  "/investments",
  "/profile",
];

const FORCE_LOGIN_COOKIE = "force_login";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (p) =>
      pathname === p ||
      pathname.startsWith(p + "/") ||
      (p.endsWith("/") && pathname.startsWith(p))
  );
}

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const forceLogin = request.cookies.get(FORCE_LOGIN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;

  // Sempre permitir callbacks e test
  if (pathname.includes("callback") || pathname === "/test" || pathname.includes("/auth/success")) {
    return NextResponse.next();
  }

  // Garantir que rotas públicas nunca sejam bloqueadas
  if (isPublicPath(pathname)) {
    if (token && pathname.startsWith("/login") && forceLogin !== "1") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Rota privada sem token → login
  if (isPrivateRoute(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Qualquer outra rota (ex.: /) sem token: não redirecionar para login; só privadas já tratadas acima
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};
