import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import { errorHandler } from "./middlewares/errorMiddleware";
import "reflect-metadata";
import "./config/container";
import "./types/session";
import { setupPassport } from "./config/passport";

// Import routes
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import accountRoutes from "./routes/accountRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import goalRoutes from "./routes/goalRoutes";
import reportRoutes from "./routes/reportRoutes";
import fileRoutes from "./routes/fileRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import creditCardRoutes from "./routes/creditCardRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import planningRoutes from "./routes/planningRoutes";
import consultantRoutes from "./routes/consultantRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Configuração de sessão (DEVE vir ANTES do Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutos
      sameSite: "strict",
    },
  })
);

// Initialize Passport (DEPOIS do express-session)
const passport = setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Rota do Stripe webhook precisa do raw body
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Configuração padrão para rotas que usam JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/credit-cards", creditCardRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/planning", planningRoutes);
app.use("/api/consultant", consultantRoutes);
app.use("/api/whatsapp", whatsappRoutes);

// Home route
app.get("/", (_req, res) => {
  res.json({
    message: "M. Finnance AI API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// 404 - rotas não encontradas (evita tela em branco se acessar backend na porta errada)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: "Rota não encontrada. A API está em /api. Frontend: use a aplicação web na porta 3000." },
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
