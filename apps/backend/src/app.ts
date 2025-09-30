import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import { errorHandler } from "./middlewares/errorMiddleware";
import "reflect-metadata";
import "./config/container";
import "./types/session";
import { setupPassport } from "./config/passport";

// Import routes
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import accountRoutes from "./routes/accountRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import goalRoutes from "./routes/goalRoutes";
import reportRoutes from "./routes/reportRoutes";
import fileRoutes from "./routes/fileRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import authRoutes from "./routes/authRoutes";
import creditCardRoutes from "./routes/creditCardRoutes";
import investmentRoutes from "./routes/investmentRoutes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Permitir cookies
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

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/credit-card", creditCardRoutes);
app.use("/api/investments", investmentRoutes);

// Home route
app.get("/", (_req, res) => {
  res.json({
    message: "FinanceAI API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
