import { Request, Response, NextFunction } from "express";

export interface SecureCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  domain?: string;
  path?: string;
}

export class CookieManager {
  /**
   * Define um cookie seguro com opções padrão
   */
  static setSecureCookie(
    res: Response,
    name: string,
    value: string,
    options: SecureCookieOptions = {}
  ): void {
    const isProduction = process.env.NODE_ENV === "production";

    const defaultOptions: SecureCookieOptions = {
      httpOnly: true,
      secure: isProduction, // HTTPS apenas em produção
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: "/",
    };

    const finalOptions = { ...defaultOptions, ...options };

    res.cookie(name, value, finalOptions);
  }

  /**
   * Define o access token como um cookie HttpOnly
   */
  static setAccessToken(res: Response, token: string): void {
    this.setSecureCookie(res, "accessToken", token, {
      maxAge: 15 * 60 * 1000, // 15 minutos
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  /**
   * Define o refresh token como um cookie HttpOnly
   */
  static setRefreshToken(res: Response, token: string): void {
    this.setSecureCookie(res, "refreshToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  /**
   * Define o cookie "token" HttpOnly (usado pelo frontend/middleware para sessão).
   * Em desenvolvimento com front e API em portas diferentes (ex.: 3000 e 3001), usa domain "localhost" para o cookie ser enviado em ambas.
   */
  static setToken(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === "production";
    this.setSecureCookie(res, "token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
      ...(!isProduction && { domain: "localhost" }),
    });
  }

  /**
   * Limpa os cookies de autenticação
   */
  static clearAuthCookies(res: Response): void {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions: { httpOnly: boolean; secure: boolean; sameSite: "strict" | "lax"; path: string; domain?: string } = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    };
    if (!isProduction) cookieOptions.domain = "localhost";

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("token", cookieOptions);
  }

  /**
   * Middleware para extrair token dos cookies (accessToken ou token HttpOnly)
   */
  static extractTokenFromCookies(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const accessToken =
      req.cookies?.accessToken ?? req.cookies?.token;
    const refreshToken = req.cookies?.refreshToken;

    (req as any).accessToken = accessToken;
    (req as any).refreshToken = refreshToken;

    next();
  }

  /**
   * Middleware para verificar se o usuário está autenticado
   */
  static requireAuth(req: Request, res: Response, next: NextFunction): void {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      res.status(401).json({
        error: "Token de acesso não encontrado",
        code: "MISSING_ACCESS_TOKEN",
      });
      return;
    }

    next();
  }
}
