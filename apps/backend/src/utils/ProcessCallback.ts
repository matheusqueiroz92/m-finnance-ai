import { container } from "../config/container";
import { TokenService } from "../services/TokenService";
import { CookieManager } from "../middlewares/cookieMiddleware";

export function processCallback(req: any, res: any) {
  try {
    // Verificar se req.user existe
    if (!req.user) {
      console.error("req.user é null/undefined");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      );
    }

    // O Passport retorna { user: IUser, token: string } no req.user
    const authResult = req.user as { user: any; token: string };

    if (!authResult || !authResult.user) {
      console.error("Usuário não encontrado no callback");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=user_not_found`
      );
    }

    // 🔐 GERAR TOKENS SEGUROS
    const tokenService = container.resolve<TokenService>("TokenService");
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      authResult.user as any
    );

    // 🍪 DEFINIR COOKIES SEGUROS (accessToken/refreshToken + token para o middleware do frontend)
    CookieManager.setAccessToken(res, accessToken);
    CookieManager.setRefreshToken(res, refreshToken);
    CookieManager.setToken(res, accessToken);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`
    );
  } catch (error) {
    console.error("Erro no callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
}
