import express from "express";
import passport from "passport";
import { container } from "../config/container";
import { ApiResponse } from "../utils/ApiResponse";
import { setupPassport } from "../config/passport";
import { CookieManager } from "../middlewares/cookieMiddleware";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  validateState,
} from "../utils/pkce";

const router = express.Router();
const passportConfig = setupPassport();

// Rota de teste para verificar se as rotas estão funcionando
router.get("/test", (req, res) => {
  ApiResponse.success(res, { message: "Auth routes funcionando!" }, "Teste OK");
});

// Rota para iniciar autenticação Google (usando Passport)
router.get("/google", (req, res) => {
  passportConfig.authenticate("google")(req, res);
});

// Função para trocar código por token (sem PKCE)
async function exchangeCodeForToken(code: string) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    }),
  });

  return await tokenResponse.json();
}

// Função para obter dados do usuário
async function getUserInfoFromGoogle(accessToken: string) {
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await userResponse.json();
}

// Callback para Google (usando Passport)
router.get("/google/callback", async (req, res) => {
  try {
    const authResult = await new Promise((resolve, reject) => {
      passportConfig.authenticate(
        "google",
        { session: false },
        (err: any, user: any, info: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!user) {
            reject(new Error("Usuário não encontrado"));
            return;
          }
          resolve(user);
        }
      )(req, res);
    });

    req.user = authResult as any;
    processCallback(req, res);
  } catch (error) {
    console.error("Erro no callback Google:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
});

// Rota para iniciar autenticação GitHub
router.get("/github", (req, res) => {
  passportConfig.authenticate("github")(req, res);
});

// Callback para GitHub
router.get("/github/callback", async (req, res) => {
  console.log("🔍 CALLBACK /github/callback CHAMADO");

  try {
    // Usar uma abordagem mais direta sem o callback do Passport
    const authResult = await new Promise((resolve, reject) => {
      passportConfig.authenticate(
        "github",
        { session: false },
        (err: any, user: any, info: any) => {
          if (err) {
            console.error("❌ Erro no Passport GitHub:", err);
            reject(err);
            return;
          }
          if (!user) {
            console.error("❌ Usuário não retornado pelo Passport:", info);
            reject(new Error("Usuário não encontrado"));
            return;
          }

          console.log(
            "🔍 DEBUG - user recebido do Passport:",
            JSON.stringify(user, null, 2)
          );
          resolve(user);
        }
      )(req, res);
    });

    console.log("🔍 DEBUG - authResult:", JSON.stringify(authResult, null, 2));

    // Processar o resultado
    req.user = authResult as any;
    processCallback(req, res);
  } catch (error) {
    console.error("Erro no callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
});

function processCallback(req: any, res: any) {
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

    // 🍪 DEFINIR COOKIES SEGUROS
    CookieManager.setAccessToken(res, accessToken);
    CookieManager.setRefreshToken(res, refreshToken);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`
    );
  } catch (error) {
    console.error("Erro no callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
}

// Facebook removido - mantendo apenas Google e GitHub

// Rota para refresh token
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      ApiResponse.error(res, "Refresh token não encontrado", 401);
      return;
    }

    const tokenService = container.resolve<TokenService>("TokenService");
    const userService = container.resolve<UserService>("UserService");

    const result = await tokenService.refreshAccessToken(
      refreshToken,
      userService
    );

    if (!result) {
      ApiResponse.error(res, "Refresh token inválido", 401);
      return;
    }

    // 🔐 DEFINIR NOVO ACCESS TOKEN
    CookieManager.setAccessToken(res, result.accessToken);

    ApiResponse.success(
      res,
      { user: result.user, accessToken: result.accessToken },
      "Token renovado com sucesso"
    );
  } catch (error) {
    console.error("❌ Erro ao renovar token:", error);
    ApiResponse.error(res, "Erro interno do servidor", 500);
    return;
  }
});

// Rota para logout seguro
router.post("/logout", (req, res) => {
  try {
    // 🍪 LIMPAR COOKIES DE AUTENTICAÇÃO
    CookieManager.clearAuthCookies(res);

    // 🗑️ LIMPAR SESSÃO
    req.session?.destroy((err) => {
      if (err) console.error("❌ Erro ao destruir sessão:", err);
    });

    console.log("✅ Logout realizado com sucesso");
    ApiResponse.success(res, null, "Logout realizado com sucesso");
  } catch (error) {
    console.error("❌ Erro no logout:", error);
    ApiResponse.error(res, "Erro interno do servidor", 500);
    return;
  }
});

// Rota para verificar status de autenticação
router.get("/me", CookieManager.extractTokenFromCookies, async (req, res) => {
  try {
    const accessToken = (req as any).accessToken;

    if (!accessToken) {
      ApiResponse.error(res, "Token de acesso não encontrado", 401);
      return;
    }

    const tokenService = container.resolve<TokenService>("TokenService");
    const payload = tokenService.verifyAccessToken(accessToken);

    if (!payload) {
      ApiResponse.error(res, "Token inválido", 401);
      return;
    }

    const userService = container.resolve<UserService>("UserService");
    const user = await userService.getUserById(payload.userId);

    if (!user) {
      ApiResponse.error(res, "Usuário não encontrado", 404);
      return;
    }

    ApiResponse.success(res, { user }, "Usuário autenticado");
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error);
    ApiResponse.error(res, "Erro interno do servidor", 500);
    return;
  }
});

export default router;
