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
   * Limpa os cookies de autenticação
   */
  static clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  /**
   * Middleware para extrair token dos cookies
   */
  static extractTokenFromCookies(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // Adicionar tokens ao request para uso posterior
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
