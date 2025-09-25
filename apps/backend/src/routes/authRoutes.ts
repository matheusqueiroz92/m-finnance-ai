import express from "express";
import passport from "passport";
import { container } from "../config/container";
import { ApiResponse } from "../utils/ApiResponse";
import { setupPassport } from "../config/passport";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "../utils/pkce";
import { CookieManager } from "../middlewares/cookieMiddleware";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";

const router = express.Router();
const passportConfig = setupPassport();

// Função para trocar código por token do Google
async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
      code_verifier: codeVerifier,
    }),
  });

  return await response.json();
}

// Função para obter dados do usuário do Google
async function getUserInfoFromGoogle(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await response.json();
}

// Rota para iniciar autenticação Google com PKCE
router.get("/google", (req, res) => {
  try {
    // Gerar PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Armazenar na sessão
    req.session = req.session || {};
    req.session.codeVerifier = codeVerifier;
    req.session.oauthState = state;

    console.log(
      "🔐 PKCE - Code Verifier gerado:",
      codeVerifier.substring(0, 10) + "..."
    );
    console.log(
      "🔐 PKCE - Code Challenge gerado:",
      codeChallenge.substring(0, 10) + "..."
    );
    console.log("🔐 PKCE - State gerado:", state.substring(0, 10) + "...");

    // Construir URL de autorização com PKCE
    const authUrl =
      `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&` +
      `response_type=code&` +
      `scope=profile email&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256&` +
      `state=${state}`;

    console.log("🔗 Redirecionando para Google OAuth com PKCE");
    res.redirect(authUrl);
  } catch (error) {
    console.error("❌ Erro ao iniciar OAuth com PKCE:", error);
    ApiResponse.error(res, "Erro interno do servidor", 500);
    return;
  }
});

// Callback seguro para autenticação Google
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    // Verificar state parameter
    if (!req.session?.oauthState || state !== req.session.oauthState) {
      console.error("❌ State parameter inválido");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_state`
      );
    }

    // Verificar code parameter
    if (!code) {
      console.error("❌ Authorization code não fornecido");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=missing_code`
      );
    }

    console.log("🔐 Callback recebido - Code:", code);
    console.log("🔐 Callback recebido - State:", state);

    // Trocar código por token do Google
    const tokenResponse = await exchangeCodeForToken(
      code as string,
      req.session.codeVerifier || ""
    );

    if (!tokenResponse.access_token) {
      console.error("❌ Falha ao obter token do Google");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=token_exchange_failed`
      );
    }

    // Obter dados do usuário do Google
    const userInfo = await getUserInfoFromGoogle(tokenResponse.access_token);

    // Buscar ou criar usuário no banco
    const userService = container.resolve<UserService>("UserService");
    const user = await userService.loginWithSocialProvider({
      provider: "google",
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      photo: userInfo.picture,
    });

    // Gerar tokens seguros
    const tokenService = container.resolve<TokenService>("TokenService");
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user.user as any
    );

    // Definir cookies seguros
    CookieManager.setAccessToken(res, accessToken);
    CookieManager.setRefreshToken(res, refreshToken);

    console.log("✅ Login social realizado com sucesso");
    console.log("🍪 Cookies seguros definidos");

    // Redirecionar SEM token na URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  } catch (error) {
    console.error("❌ Erro no callback OAuth:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
});

// Rota para iniciar autenticação Facebook
router.get(
  "/facebook",
  passportConfig.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);

// Callback para autenticação Facebook
router.get(
  "/facebook/callback",
  passportConfig.authenticate("facebook", { session: false }),
  (req, res) => {
    const { user, token } = req.user as { user: any; token: string };

    // Gerar tokens seguros
    const tokenService = container.resolve<TokenService>("TokenService");
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user.user as any
    );

    // Definir cookies seguros
    CookieManager.setAccessToken(res, accessToken);
    CookieManager.setRefreshToken(res, refreshToken);

    console.log("✅ Login social realizado com sucesso");
    console.log("🍪 Cookies seguros definidos");

    // Redirecionar SEM token na URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }
);

// Rota para iniciar autenticação GitHub
router.get("/github", passportConfig.authenticate("github"));

// Callback para autenticação GitHub
router.get(
  "/github/callback",
  passportConfig.authenticate("github", { session: false }),
  (req, res) => {
    const { user, token } = req.user as { user: any; token: string };

    // Gerar tokens seguros
    const tokenService = container.resolve<TokenService>("TokenService");
    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user.user as any
    );

    // Definir cookies seguros
    CookieManager.setAccessToken(res, accessToken);
    CookieManager.setRefreshToken(res, refreshToken);

    console.log("✅ Login social realizado com sucesso");
    console.log("🍪 Cookies seguros definidos");

    // Redirecionar SEM token na URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }
);

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

    // Definir novo access token
    CookieManager.setAccessToken(res, result.accessToken);

    ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
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
    // Limpar cookies de autenticação
    CookieManager.clearAuthCookies(res);

    // Limpar sessão
    req.session?.destroy((err) => {
      if (err) {
        console.error("❌ Erro ao destruir sessão:", err);
      }
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
