/**
 * API fake de autenticação para testes offline (sem MongoDB).
 * Simula login, perfil e logout com dados do Faker e cookie HttpOnly.
 *
 * Uso: na pasta apps/backend, execute `npm run fake-api`.
 * Depois inicie o frontend (apps/web) com `npm run dev`. O proxy aponta para localhost:3001.
 *
 * Credenciais: qualquer email/senha aceita (ex: teste@teste.com / 123456).
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { faker } = require("@faker-js/faker");

const PORT = process.env.PORT || 3001;
const sessions = new Map(); // token -> user

function createFakeUser(overrides = {}) {
  const now = new Date();
  return {
    _id: faker.string.uuid(),
    name: overrides.name ?? faker.person.fullName(),
    email: overrides.email ?? faker.internet.email(),
    dateOfBirth: overrides.dateOfBirth,
    cpf: overrides.cpf,
    phone: overrides.phone,
    avatar: overrides.avatar,
    language: overrides.language ?? "pt-BR",
    isPremium: overrides.isPremium ?? false,
    isEmailVerified: overrides.isEmailVerified ?? true,
    twoFactorEnabled: overrides.twoFactorEnabled ?? false,
    newsletterEnabled: overrides.newsletterEnabled ?? false,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

function apiSuccess(res, data, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function apiError(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    ...(!isProduction && { domain: "localhost" }),
  });
}

function clearTokenCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";
  const opts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  };
  if (!isProduction) opts.domain = "localhost";
  res.clearCookie("token", opts);
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// POST /api/users/login — aceita qualquer email/senha
app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return apiError(res, "Por favor, forneça email e senha", 400);
  }
  const user = createFakeUser({ email });
  const token = faker.string.alphanumeric(32);
  sessions.set(token, user);
  setTokenCookie(res, token);
  return apiSuccess(res, { user }, "Login realizado com sucesso");
});

// POST /api/auth/login (alias)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return apiError(res, "Por favor, forneça email e senha", 400);
  }
  const user = createFakeUser({ email });
  const token = faker.string.alphanumeric(32);
  sessions.set(token, user);
  setTokenCookie(res, token);
  return apiSuccess(res, { user }, "Login realizado com sucesso");
});

// GET /api/auth/profile — exige cookie token
app.get("/api/auth/profile", (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return apiError(res, "Token de acesso não encontrado", 401);
  }
  const user = sessions.get(token);
  if (!user) {
    return apiError(res, "Token inválido ou expirado", 401);
  }
  return apiSuccess(res, user, "Perfil recuperado com sucesso");
});

// POST /api/users/logout
app.post("/api/users/logout", (req, res) => {
  const token = req.cookies?.token;
  if (token) sessions.delete(token);
  clearTokenCookie(res);
  return apiSuccess(res, null, "Logout realizado com sucesso");
});

// POST /api/auth/logout (alias)
app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies?.token;
  if (token) sessions.delete(token);
  clearTokenCookie(res);
  return apiSuccess(res, null, "Logout realizado com sucesso");
});

app.listen(PORT, () => {
  console.log(`[fake-auth-api] Rodando em http://localhost:${PORT}`);
  console.log("  POST /api/users/login  — login (qualquer email/senha)");
  console.log("  GET  /api/auth/profile — perfil (cookie token)");
  console.log("  POST /api/users/logout — logout");
});
