import express from "express";
import { container } from "../config/container";
import { ApiResponse } from "../utils/ApiResponse";
import { setupPassport } from "../config/passport";
import { CookieManager } from "../middlewares/cookieMiddleware";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { avatarUpload } from "../config/multer";
import { processCallback } from "../utils/ProcessCallback";
import {
  userLoginSchema,
  changePasswordSchema,
} from "../validators/userValidator";

const router = express.Router();
const passportConfig = setupPassport();
const userController = container.resolve(UserController);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação de usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665f1b2c3a4d5e6f7a8b9c0d"
 *         name:
 *           type: string
 *           example: "João da Silva"
 *         email:
 *           type: string
 *           example: "joao@email.com"
 *         avatar:
 *           type: string
 *           example: "https://cdn.exemplo.com/avatar.jpg"
 *         isVerified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "joao@email.com"
 *         password:
 *           type: string
 *           example: "senha123"
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "senhaAntiga123"
 *         newPassword:
 *           type: string
 *           example: "novaSenha456"
 */

// ==================== ROTAS DE AUTENTICAÇÃO BÁSICA ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/register",
  avatarUpload.single("avatar"),
  userController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", validate(userLoginSchema), userController.login);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verifica o e-mail do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "token-de-verificacao"
 *     responses:
 *       200:
 *         description: E-mail verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/verify-email", userController.verifyEmail);

/**
 * @swagger
 * /api/auth/verify-email-public:
 *   post:
 *     summary: Verifica o e-mail do usuário (rota pública)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "token-de-verificacao"
 *     responses:
 *       200:
 *         description: E-mail verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/verify-email-public", userController.verifyEmailPublic);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 */
router.get("/profile", protect, userController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João da Silva"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.put(
  "/profile",
  protect,
  avatarUpload.single("avatar"),
  userController.updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Altera a senha do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenvia o e-mail de verificação
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: E-mail de verificação reenviado
 *       401:
 *         description: Não autorizado
 */
router.post(
  "/resend-verification",
  protect,
  userController.resendVerificationEmail
);

// ==================== ROTAS DE AUTENTICAÇÃO SOCIAL ====================

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Testa se as rotas de autenticação estão funcionando
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Teste OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Auth routes funcionando!"
 */
router.get("/test", (req, res) => {
  ApiResponse.success(res, { message: "Auth routes funcionando!" }, "Teste OK");
});

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Inicia autenticação social com Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redireciona para o Google para autenticação
 */
router.get("/google", (req, res) => {
  passportConfig.authenticate("google")(req, res);
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback para Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redireciona para a URL de sucesso
 */
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

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Inicia autenticação social com GitHub
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redireciona para o GitHub para autenticação
 */
router.get("/github", (req, res) => {
  passportConfig.authenticate("github")(req, res);
});

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: Callback para GitHub
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redireciona para a URL de sucesso
 */
router.get("/github/callback", async (req, res) => {
  try {
    const authResult = await new Promise((resolve, reject) => {
      passportConfig.authenticate(
        "github",
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
    console.error("Erro no callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Atualiza o token de acesso
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token de acesso atualizado com sucesso
 */
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

    // 🔐 Novo accessToken no body; frontend persiste no cookie "token" se necessário
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Realiza logout do usuário
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
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

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Verifica o status de autenticação
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Usuário autenticado
 */
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
