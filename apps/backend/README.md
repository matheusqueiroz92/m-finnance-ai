# M. Finnance AI — Backend

API REST da plataforma M. Finnance AI, construída em **Node.js**, **Express** e **TypeScript**, com arquitetura em camadas, injeção de dependência (TSyringe) e documentação Swagger.

## Índice

- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas da API](#-rotas-da-api)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [API fake (testes offline)](#-api-fake-testes-offline)
- [Testes](#-testes)
- [Docker](#-docker)

## 🛠 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime |
| **Express 5** | Framework web |
| **TypeScript** | Tipagem estática |
| **MongoDB + Mongoose** | Banco de dados NoSQL |
| **TSyringe** | Injeção de dependência |
| **Zod** | Validação de schemas |
| **JWT** | Access e refresh tokens |
| **Passport.js** | OAuth (Google, GitHub) |
| **express-session** | Sessões |
| **Bcrypt** | Hash de senhas |
| **Multer** | Upload de arquivos (avatar, anexos) |
| **PDFKit / ExcelJS** | Relatórios PDF e Excel |
| **Stripe** | Pagamentos e assinaturas |
| **Nodemailer** | E-mails (verificação, recuperação de senha) |
| **Twilio** | Notificações |
| **Swagger (swagger-ui-express)** | Documentação da API |
| **Jest** | Testes unitários e integração |
| **Supertest** | Testes de requisições HTTP |

## 📁 Estrutura do Projeto

```
apps/backend/src/
├── app.ts                 # Configuração do Express, middlewares e rotas
├── server.ts              # Entrada do servidor
├── config/
│   ├── container.ts       # Registro de dependências (TSyringe)
│   ├── database.ts        # Conexão MongoDB
│   ├── jwt.ts             # Configuração JWT
│   ├── multer.ts          # Configuração de upload (avatar, anexos)
│   └── passport.ts        # Estratégias OAuth (Google, GitHub)
├── controllers/           # Controllers (HTTP)
│   ├── AccountController.ts
│   ├── CategoryController.ts
│   ├── ConsultantController.ts
│   ├── CreditCardController.ts
│   ├── GoalController.ts
│   ├── InvestmentController.ts
│   ├── PaymentController.ts
│   ├── PlanningController.ts
│   ├── ReportController.ts
│   ├── SubscriptionController.ts
│   ├── TransactionController.ts
│   ├── UserController.ts
│   └── WhatsAppWebhookController.ts
├── interfaces/            # Contratos (repositórios, serviços, entidades)
├── middlewares/
│   ├── authMiddleware.ts  # Proteção de rotas (JWT, userId)
│   ├── cookieMiddleware.ts
│   ├── errorMiddleware.ts
│   ├── premiumMiddleware.ts
│   ├── twilioWebhookMiddleware.ts  # Validação X-Twilio-Signature
│   └── validationMiddleware.ts
├── repositories/          # Acesso a dados (MongoDB)
├── routes/                # Definição de rotas
│   ├── accountRoutes.ts
│   ├── authRoutes.ts
│   ├── categoryRoutes.ts
│   ├── consultantRoutes.ts
│   ├── creditCardRoutes.ts
│   ├── fileRoutes.ts
│   ├── goalRoutes.ts
│   ├── investmentRoutes.ts
│   ├── paymentRoutes.ts
│   ├── planningRoutes.ts
│   ├── reportRoutes.ts
│   ├── subscriptionRoutes.ts
│   ├── transactionRoutes.ts
│   └── whatsappRoutes.ts
├── schemas/               # Modelos Mongoose
├── services/               # Lógica de negócio
│   ├── AccountService.ts
│   ├── AIAnalysisService.ts
│   ├── BillingService.ts
│   ├── CategoryService.ts
│   ├── CreditCardService.ts
│   ├── FinancialConsultantService.ts
│   ├── FinancialPlanningService.ts
│   ├── GoalService.ts
│   ├── InvestmentService.ts
│   ├── NotificationService.ts
│   ├── ReportService.ts
│   ├── StripePaymentService.ts
│   ├── SubscriptionService.ts
│   ├── TokenService.ts
│   ├── TransactionService.ts
│   ├── UserService.ts
│   └── WhatsAppTransactionService.ts
├── swagger.json           # Especificação da API
├── types/                 # Tipos globais (Express, session)
├── utils/                 # ApiError, ApiResponse, ExpenseMessageParser, HybridExpenseMessageParser, PKCE, ProcessCallback, TokenUtils, TransactionManager
└── validators/            # Schemas Zod por domínio
```

Na raiz do backend: `scripts/fake-auth-api.cjs` — API fake de autenticação para testes offline (Faker).

## 🔌 Rotas da API

Base URL: `/api`

| Recurso | Prefixo | Descrição |
|---------|---------|-----------|
| Autenticação / Usuário | `/auth`, `/users` | Login, registro, perfil, refresh, logout, OAuth, verificação de e-mail, recuperação de senha |
| Contas | `/accounts` | CRUD de contas bancárias e resumo |
| Categorias | `/categories` | CRUD de categorias |
| Transações | `/transactions` | CRUD de transações e estatísticas |
| Metas | `/goals` | CRUD de metas e estatísticas |
| Cartões de crédito | `/credit-cards` | CRUD de cartões e resumo |
| Investimentos | `/investments` | CRUD de investimentos e resumo |
| Relatórios | `/reports` | Gerar relatório, insights, score, recomendações, tendências |
| Planejamento | `/planning` | Plano financeiro, simulador, aderência |
| Consultor IA | `/consultant` | Sessões de chat e mensagens ao consultor |
| WhatsApp | `/whatsapp` | Webhook Twilio (mensagens recebidas → criação de transação) |
| Arquivos | `/files` | Avatar (público), anexos e download de transações |
| Assinaturas | `/subscriptions` | Plano, trial, cancelamento |
| Pagamentos | `/payments` | Checkout, métodos, webhook Stripe |

**Documentação interativa:** quando o servidor está rodando, acesse [http://localhost:3001/api-docs](http://localhost:3001/api-docs).

## ⚙️ Configuração

### Requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- npm ou yarn

### Variáveis de ambiente

Crie um arquivo `.env` na pasta `apps/backend` (ou na raiz do monorepo, conforme seu fluxo):

```env
PORT=3001
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/m-finnance-ai

JWT_SECRET=seu_segredo_jwt
JWT_REFRESH_SECRET=seu_segredo_refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

SESSION_SECRET=seu_segredo_sessao

APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# E-mail (Nodemailer)
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=seu_email@exemplo.com
SMTP_PASS=sua_senha

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# IA (consultor, parser de despesas WhatsApp)
OPENAI_API_KEY=sk-...

# WhatsApp (Twilio webhook)
TWILIO_AUTH_TOKEN=seu_auth_token
```

## 🏁 Execução

Na raiz do monorepo:

```bash
npm run dev
```

Apenas o backend:

```bash
cd apps/backend
npm install
npm run dev
```

O servidor sobe em **http://localhost:3001**. Build para produção:

```bash
npm run build
npm start
```

Para testar o frontend sem banco de dados: use `npm run fake-api` para subir apenas a API fake de autenticação na porta 3001 (veja seção [API fake](#-api-fake-testes-offline)).

## 🔌 API fake (testes offline)

Permite testar o frontend sem MongoDB e sem subir o backend completo.

**Comando** (em `apps/backend`):

```bash
npm run fake-api
```

Sobe um servidor Express na porta 3001 (ou `PORT`) que simula:

| Método | Endpoint                | Descrição |
|--------|-------------------------|-----------|
| POST   | `/api/users/login`      | Login (qualquer email/senha); retorna usuário fake e define cookie HttpOnly `token` |
| POST   | `/api/auth/login`       | Alias do login |
| GET    | `/api/auth/profile`     | Perfil do usuário (requer cookie `token`) |
| POST   | `/api/users/logout`     | Logout (limpa cookie e sessão em memória) |
| POST   | `/api/auth/logout`      | Alias do logout |

Os dados do usuário são gerados com **@faker-js/faker** (devDependency). Uso típico: rode `npm run fake-api`, depois em outro terminal `cd apps/web && npm run dev`; o proxy do Next.js já aponta para `http://localhost:3001`.

## 🧪 Testes

Os testes usam **Jest** e estão em `src/tests/`:

- **config** — banco de testes
- **controllers** — Account, Category, CreditCard, Consultant, Goal, Report, Transaction, User, WhatsAppWebhook
- **integration** — authRoutes, insightsRoutes
- **middlewares** — auth, error, validation
- **repositories** — todos os repositórios
- **services** — todos os serviços (incl. WhatsAppTransactionService e cenários de mensagens reais)
- **utils** — ApiError, ApiResponse, ExpenseMessageParser, HybridExpenseMessageParser, pkce, ProcessCallback, TokenUtils, TransactionManager
- **validators** — validadores Zod

Comandos:

```bash
cd apps/backend
npm test           # executa testes com cobertura
npm run test:watch # modo watch
```

## 🐳 Docker

O backend pode ser executado via Docker Compose a partir da raiz do projeto:

```bash
docker-compose up -d
```

O serviço `backend` escuta na porta **3001** e depende do serviço **mongodb**. Consulte o [README principal](../../README.md) para variáveis e uso completo do Docker.

---

Para visão geral do projeto, arquitetura e frontend, veja o [README principal](../../README.md).
