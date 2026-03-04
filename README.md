# M. Finnance AI

![Logo da M. Finnance AI](apps/web/public/images/logo-dark-mode-m-finnance-ai.png)

M. Finnance AI é uma plataforma completa de gestão financeira pessoal com recursos avançados de inteligência artificial para análise de gastos, orçamentos, investimentos e planejamento financeiro.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-808080?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-2E8B57?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongoose.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com//)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-FF1E56?style=for-the-badge&logo=turborepo&logoColor=white)](https://turborepo.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)
[![Stripe](https://img.shields.io/badge/Stripe-EE82EE?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Segurança](#-segurança)
- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [API](#-api)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Instalação e Execução](#-instalação-e-execução)
- [Testes](#-testes)
- [Roadmap](#-roadmap)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Documentação por aplicação](#-documentação-por-aplicação)

### 📚 Documentação por aplicação

- **[Backend](apps/backend/README.md)** — API REST, rotas, serviços e testes
- **[Web (Frontend)](apps/web/README.md)** — Next.js, páginas e componentes

## 🧭 Visão Geral

M. Finnance AI é uma plataforma inovadora e completa para gestão de finanças pessoais, que integrada com inteligência artificial para análise e otimização dos dados financeiros dos usuários. Com ela, é possível monitorar receitas, despesas, definir e acompanhar metas financeiras, gerenciar múltiplas contas e receber insights personalizados baseados em padrões reais de comportamento financeiro. A IA embarcada oferece recomendações inteligentes e automáticas, auxiliando o usuário a tomar decisões mais assertivas e a alcançar seus objetivos financeiros de forma eficiente e segura.

### Diferenciais

- **Análise Inteligente**: Algoritmos de IA analisam os padrões de gastos e fornecem recomendações personalizadas
- **Visualização de Dados**: Dashboards interativos para visualizar o fluxo financeiro
- **Multi-plataforma**: Disponível em web e futuras versões mobile
- **Segurança**: Dados criptografados e práticas seguras de autenticação

## 🔒 Segurança

### Melhorias de Segurança Implementadas

- **Passport.js**: Estratégias seguras de autenticação social
- **Cookies HttpOnly**: Tokens armazenados em cookies seguros, inacessíveis via JavaScript
- **Refresh Tokens**: Sistema de renovação automática de tokens
- **State Parameter**: Proteção CSRF em fluxos OAuth
- **Sessões Seguras**: Gerenciamento de sessões com express-session
- **Validação de Tipos**: TypeScript com verificações rigorosas de tipos
- **Verificação de Autenticação**: Middleware robusto para validação de usuários
- **Logout Seguro**: Limpeza completa de cookies e sessões

### Fluxo de Autenticação com Login Convencional

1. **Inicialização**: Usuário preeche os campos de usuário e senha e clica em "Login"
2. **Validação de Credenciais**: Backend recebe usuário e senha, valida as credenciais no banco de dados
3. **Verificação de Autenticação**: Se as credenciais estiverem corretas, o backend prossegue; caso contrário, retorna erro de autenticação
4. **Geração de Tokens**: Backend gera access token e refresh token para o usuário autenticado
5. **Definição de Cookies Seguros**: Tokens são enviados ao frontend e armazenados em cookies HttpOnly e Secure
6. **Redirecionamento**: Usuário autenticado é redirecionado para o dashboard da aplicação

### Fluxo de Autenticação com Login Social

1. **Inicialização**: Usuário clica em "Login com Google/GitHub"
2. **Redirecionamento**: Usuário é redirecionado para provedor OAuth
3. **Autorização**: Provedor autentica e retorna código de autorização
4. **Callback**: Backend recebe callback e processa dados do usuário
5. **Criação de Usuário**: Sistema cria/atualiza usuário no banco
6. **Geração de Tokens**: Backend gera access token e refresh token
7. **Cookies Seguros**: Tokens são definidos como cookies HttpOnly
8. **Redirecionamento**: Usuário é redirecionado para dashboard
9. **Verificação**: Frontend verifica autenticação via cookies seguros

## 🚀 Recursos

### Gestão Financeira

- Rastreamento de transações (receitas, despesas, investimentos)
- Categorização inteligente de transações
- Gestão de contas bancárias e saldos (carteira)
- **Cartões de crédito**: cadastro, faturas, transações e validação de código de segurança
- **Investimentos**: portfólio, desempenho e resumo
- **Planejamento financeiro**: plano personalizado, simulador e acompanhamento de aderência
- Planejamento e acompanhamento de metas financeiras
- Relatórios financeiros personalizados (PDF e Excel)
- Upload de anexos, comprovantes e recibos de transações
- Upload de avatar do usuário
- **WhatsApp**: cadastro de despesas por mensagem (webhook Twilio), vinculação de telefone no perfil

### Recursos de IA

- Análise de padrões de gastos
- Recomendações para otimização de despesas
- Previsões financeiras baseadas em histórico
- Score financeiro pessoal
- Sugestões para melhorar saúde financeira
- **Consultor financeiro por chat** (com contexto do usuário e histórico de sessões)
- **Planejamento financeiro** (simulador, aderência e plano personalizado)
- **Parser híbrido** (regex + IA) para mensagens de despesa via WhatsApp

### Relatórios e Exportação

- Dashboards interativos com visualizações
- Relatórios detalhados por categoria e período
- Exportação em PDF e Excel
- Análises comparativas mês a mês

### Sistema de Assinaturas

- Plano Free com recursos básicos
- Plano Premium com recursos avançados
- Período de teste de 30 dias
- Gerenciamento de pagamentos via Stripe

### Autenticação Segura

- Cadastro e login tradicionais
- Login via redes sociais (Google, GitHub) com Passport.js
- Autenticação JWT com refresh tokens
- Cookies HttpOnly para máxima segurança
- Proteção CSRF com state parameter
- Recuperação de senha
- Sessões seguras com express-session

## 💻 Tecnologias

### Backend

- **Node.js**: Ambiente de execução JavaScript
- **TypeScript**: Extensão tipada de JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT**: Autenticação baseada em tokens com refresh tokens
- **Passport.js**: Estratégias de autenticação social seguras
- **Express-Session**: Gerenciamento seguro de sessões
- **Zod**: Validação de esquemas
- **Bcrypt**: Hashing de senhas
- **PDFKit/ExcelJS**: Geração de relatórios em PDF e Excel
- **Stripe**: Gateway de pagamento
- **Passport**: Estratégias de autenticação social
- **Jest**: Framework de testes
- **TSyringe**: Injeção de dependência
- **Multer**: Upload de arquivos
- **Crypto**: Geração segura de tokens e hashes
- **Nodemailer**: Envio de e-mails (verificação, recuperação de senha)
- **Twilio**: Notificações (SMS/push)
- **UUID**: Identificadores únicos
- **PKCE**: Suporte a fluxo OAuth seguro

### Frontend (Web)

- **Next.js 15**: Framework React com App Router e Turbopack
- **React 19**: Biblioteca de interface
- **TypeScript**: Tipagem estática
- **TanStack React Query**: Cache, sincronização e estado de dados
- **React Hook Form + Zod**: Formulários e validação
- **Radix UI / shadcn-ui**: Componentes acessíveis
- **Tailwind CSS 4**: Estilização
- **Recharts**: Gráficos (dashboard, investimentos)
- **next-themes**: Tema claro/escuro
- **Sonner**: Notificações toast
- **Lucide React**: Ícones
- **date-fns / react-day-picker**: Datas
- **Axios**: Cliente HTTP (withCredentials para cookies)
- **Cookies HttpOnly**: Token definido apenas pelo backend; cliente não acessa token (mitigação XSS)
- **ExcelJS / jsPDF**: Exportação no cliente (relatórios)

### DevOps

- **Docker**: Containerização
- **Docker Compose**: Orquestração de containers
- **Turborepo**: Gerenciamento de monorepo
- **GitHub Actions**: CI/CD (planejado)

## 📐 Arquitetura

M. Finnance AI segue uma arquitetura moderna baseada nos princípios do SOLID, Clean Architecture e Engenharia de Software.

### Estrutura de Monorepo

O projeto utiliza **Turborepo** para gerenciar um monorepo com múltiplos pacotes:

```
m-finnance-ai/
├── apps/
│   ├── backend/    # API REST em Node.js/Express (TypeScript)
│   └── web/        # Frontend web em Next.js 15 (App Router, React 19)
└── packages/
    ├── eslint-config/      # Configurações compartilhadas de ESLint
    ├── typescript-config/  # Configurações compartilhadas de TypeScript (base, nextjs, react-library)
    └── ui/                  # Componentes de UI compartilhados (Button, Card, Code)
```

### Arquitetura Backend

O backend segue uma arquitetura em camadas com injeção de dependência, inspirada pelos princípios SOLID e Clean Architecture:

![Arquitetura Backend](https://via.placeholder.com/800x400?text=Backend+Architecture)

1. **Controllers**: Lidam com as requisições HTTP e respostas
2. **Services**: Contêm a lógica de negócios principal
3. **Repositories**: Fornecem acesso aos dados
4. **Models/Schemas**: Definem a estrutura dos dados
5. **Middlewares**: Processam requisições (autenticação, validação, etc.)
6. **Utils**: Funções utilitárias reutilizáveis

#### Injeção de Dependência

Utilizamos TSyringe para implementar injeção de dependência, permitindo:

- Desacoplamento entre componentes
- Maior testabilidade
- Flexibilidade para trocar implementações

#### Interfaces e Abstrações

Todas as interações entre camadas são baseadas em interfaces, não em implementações concretas, o que facilita:

- Manutenção
- Extensibilidade
- Testes unitários
- Substituição de implementações (como diferentes gateways de pagamento)

#### Arquitetura de Segurança

O sistema implementa múltiplas camadas de segurança:

1. **Camada de Autenticação**:

   - Passport.js para OAuth 2.0
   - JWT com refresh tokens
   - Cookies HttpOnly
   - Validação de state parameter

2. **Camada de Autorização**:

   - Middleware de autenticação
   - Verificação de tokens
   - Controle de acesso baseado em roles

3. **Camada de Dados**:

   - Validação de tipos TypeScript
   - Sanitização de inputs
   - Criptografia de senhas com bcrypt

4. **Camada de Sessão**:
   - Express-session com configurações seguras
   - Limpeza automática de sessões
   - Proteção contra CSRF

### Fluxo de Dados

1. As requisições chegam aos Controllers
2. Controllers invocam Services com dados validados
3. Services orquestram operações de negócios usando Repositories
4. Repositories interagem com o banco de dados
5. Os dados fluem de volta pelo mesmo caminho

## 🔌 API

### Documentação

A API é documentada usando o Swagger e está disponível em `/api-docs` quando o servidor está em execução.

### Endpoints Principais

#### Autenticação Segura

| Método | Endpoint              | Descrição                        |
| ------ | --------------------- | -------------------------------- |
| POST   | `/api/users/register` | Registrar novo usuário           |
| POST   | `/api/users/login`    | Login de usuário                 |
| GET    | `/api/auth/google`    | Iniciar autenticação via Google  |
| GET    | `/api/auth/github`    | Iniciar autenticação via GitHub  |
| POST   | `/api/auth/refresh`   | Renovar access token             |
| POST   | `/api/auth/logout`    | Logout seguro                    |
| GET    | `/api/auth/me`        | Verificar status de autenticação |

#### Usuários

| Método | Endpoint                     | Descrição                   |
| ------ | ---------------------------- | --------------------------- |
| GET    | `/api/auth/profile`          | Obter perfil do usuário     |
| PUT    | `/api/auth/profile`          | Atualizar perfil do usuário |
| POST   | `/api/users/change-password` | Alterar senha               |

#### Transações

| Método | Endpoint                  | Descrição                  |
| ------ | ------------------------- | -------------------------- |
| POST   | `/api/transactions`       | Criar transação            |
| GET    | `/api/transactions`       | Listar transações          |
| GET    | `/api/transactions/stats` | Estatísticas de transações |
| GET    | `/api/transactions/:id`   | Obter transação por ID     |
| PUT    | `/api/transactions/:id`   | Atualizar transação        |
| DELETE | `/api/transactions/:id`   | Excluir transação          |

#### Contas

| Método | Endpoint                | Descrição          |
| ------ | ----------------------- | ------------------ |
| POST   | `/api/accounts`         | Criar conta        |
| GET    | `/api/accounts`         | Listar contas      |
| GET    | `/api/accounts/summary` | Resumo de contas   |
| GET    | `/api/accounts/:id`     | Obter conta por ID |
| PUT    | `/api/accounts/:id`     | Atualizar conta    |
| DELETE | `/api/accounts/:id`     | Excluir conta      |

#### Categorias

| Método | Endpoint              | Descrição              |
| ------ | --------------------- | ---------------------- |
| POST   | `/api/categories`     | Criar categoria        |
| GET    | `/api/categories`     | Listar categorias      |
| GET    | `/api/categories/:id` | Obter categoria por ID |
| PUT    | `/api/categories/:id` | Atualizar categoria    |
| DELETE | `/api/categories/:id` | Excluir categoria      |

#### Metas

| Método | Endpoint           | Descrição             |
| ------ | ------------------ | --------------------- |
| POST   | `/api/goals`       | Criar meta            |
| GET    | `/api/goals`       | Listar metas          |
| GET    | `/api/goals/stats` | Estatísticas de metas |
| GET    | `/api/goals/:id`   | Obter meta por ID     |
| PUT    | `/api/goals/:id`   | Atualizar meta        |
| DELETE | `/api/goals/:id`   | Excluir meta          |

#### Cartões de Crédito

| Método | Endpoint                         | Descrição                        |
| ------ | -------------------------------- | -------------------------------- |
| POST   | `/api/credit-cards`              | Criar cartão de crédito          |
| GET    | `/api/credit-cards`              | Listar cartões                   |
| GET    | `/api/credit-cards/summary`      | Resumo dos cartões               |
| GET    | `/api/credit-cards/:id`          | Obter cartão por ID              |
| PUT    | `/api/credit-cards/:id`          | Atualizar cartão                 |
| DELETE | `/api/credit-cards/:id`          | Excluir cartão                   |

#### Investimentos

| Método | Endpoint                    | Descrição               |
| ------ | --------------------------- | ----------------------- |
| POST   | `/api/investments`          | Criar investimento      |
| GET    | `/api/investments`          | Listar investimentos    |
| GET    | `/api/investments/summary`  | Resumo de investimentos |
| GET    | `/api/investments/:id`      | Obter investimento por ID |
| PUT    | `/api/investments/:id`      | Atualizar investimento  |
| DELETE | `/api/investments/:id`      | Excluir investimento    |

#### Relatórios e Insights

| Método | Endpoint                           | Descrição                    |
| ------ | ---------------------------------- | ---------------------------- |
| GET    | `/api/reports/generate`            | Gerar relatório financeiro   |
| GET    | `/api/reports/insights`            | Obter insights de IA         |
| GET    | `/api/reports/insights/score`      | Score financeiro pessoal     |
| GET    | `/api/reports/insights/recommendations` | Recomendações de IA   |
| GET    | `/api/reports/insights/trends`     | Tendências financeiras       |

#### Arquivos

| Método | Endpoint                                      | Descrição                    |
| ------ | ---------------------------------------------- | ---------------------------- |
| GET    | `/api/files/avatar/:filename`                  | Obter avatar (público)       |
| GET    | `/api/files/attachment/:transactionId/:attachmentId` | Obter anexo de transação |
| GET    | `/api/files/attachments/:transactionId`        | Listar anexos da transação   |
| GET    | `/api/files/download/attachment/:transactionId/:attachmentId` | Download de anexo |

#### Assinaturas

| Método | Endpoint                    | Descrição                |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/subscriptions`        | Obter assinatura atual   |
| POST   | `/api/subscriptions/trial`  | Iniciar período de teste |
| POST   | `/api/subscriptions/cancel` | Cancelar assinatura      |
| PUT    | `/api/subscriptions/plan`   | Atualizar plano          |

#### Pagamentos

| Método | Endpoint                 | Descrição                         |
| ------ | ------------------------ | --------------------------------- |
| POST   | `/api/payments/checkout` | Criar sessão de checkout          |
| GET    | `/api/payments/methods`  | Listar métodos de pagamento       |
| POST   | `/api/payments/webhook`  | Webhook para eventos de pagamento |

#### Planejamento

| Método | Endpoint                    | Descrição                          |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/api/planning/plan`        | Plano financeiro do usuário        |
| GET    | `/api/planning/simulate`    | Simular cenários de economia       |
| GET    | `/api/planning/adherence`   | Aderência ao plano                 |

#### Consultor IA

| Método | Endpoint                         | Descrição                    |
| ------ | --------------------------------- | ---------------------------- |
| POST   | `/api/consultant/sessions`        | Criar sessão de chat         |
| GET    | `/api/consultant/sessions`        | Listar sessões do usuário    |
| GET    | `/api/consultant/sessions/:id`    | Obter sessão com mensagens   |
| POST   | `/api/consultant/chat`            | Enviar mensagem ao consultor |

#### WhatsApp (webhook Twilio)

| Método | Endpoint                    | Descrição                                  |
| ------ | --------------------------- | ------------------------------------------ |
| POST   | `/api/whatsapp/webhook`     | Webhook para mensagens recebidas (Twilio)  |

### Exemplos de Requisições

#### Registro de Usuário

```json
POST /api/users/register
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### Criar Transação

```json
POST /api/transactions
{
  "account": "64f7e12345678901234567b9",
  "category": "64f7e12345678901234567c5",
  "amount": 150.50,
  "type": "expense",
  "description": "Supermercado",
  "date": "2025-05-07T14:30:00Z"
}
```

#### Criar Meta Financeira

```json
POST /api/goals
{
  "name": "Férias",
  "targetAmount": 5000,
  "currentAmount": 1000,
  "targetDate": "2025-12-25T00:00:00Z",
  "category": "Lazer",
  "icon": "beach"
}
```

## ⚙️ Configuração do Ambiente

### Requisitos

- Node.js (v18+)
- npm ou yarn
- MongoDB (local ou Atlas)
- Docker e Docker Compose (opcional)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/organfinancialai

# JWT (Autenticação)
JWT_SECRET=seu_segredo_jwt_aqui
JWT_REFRESH_SECRET=seu_segredo_refresh_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Sessões
SESSION_SECRET=seu_segredo_sessao_aqui

# URLs
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Email
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=seu_email@exemplo.com
SMTP_PASS=sua_senha

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Autenticação Social (OAuth 2.0 com Passport.js)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# IA (Consultor, parser de despesas WhatsApp)
OPENAI_API_KEY=sk-...
# AI_EXPENSE_PARSER_MODEL=gpt-4o-mini  # opcional; padrão: gpt-4o-mini

# WhatsApp (Twilio webhook)
TWILIO_AUTH_TOKEN=seu_auth_token
# TWILIO_WHATSAPP_WEBHOOK_URL=https://api.seudominio.com/api/whatsapp/webhook
```

## 🏁 Instalação e Execução

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/m-finnance-ai.git
cd m-finnance-ai

# Instale as dependências (raiz do monorepo)
npm install

# Inicie todos os apps em modo desenvolvimento (backend + web via Turborepo)
npm run dev
```

Para rodar apenas um app:

```bash
# Apenas backend
cd apps/backend && npm run dev

# Apenas frontend
cd apps/web && npm run dev
```

### Testar sem backend real (API fake)

É possível testar o frontend sem MongoDB ou o backend completo, usando a API fake de autenticação:

1. No terminal, na pasta do backend: `cd apps/backend` e execute `npm run fake-api`. Sobe um servidor na porta 3001 que simula login, perfil e logout com dados do Faker.
2. Em outro terminal, na pasta do frontend: `cd apps/web` e execute `npm run dev`. O proxy do Next.js já aponta para `http://localhost:3001`.
3. Qualquer email/senha funciona (ex.: `teste@teste.com` / `123456`).

### Usando Docker

O `docker-compose.yml` sobe três serviços: **MongoDB**, **backend** (porta 3001) e **web** (porta 3000).

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/m-finnance-ai.git
cd m-finnance-ai

# Inicie os contêineres
docker-compose up -d

# Para parar os contêineres
docker-compose down
```

## 🧪 Testes

O projeto usa Jest para testes automatizados.

**Backend** (em `apps/backend`):

```bash
cd apps/backend
npm test           # executa testes com cobertura
npm run test:watch # modo watch
```

**Frontend** (em `apps/web`):

```bash
cd apps/web
npm test           # executa testes Jest (ex.: fluxo de login)
```

Exemplo de teste no frontend: fluxo de login em `apps/web/src/components/auth/__tests__/loginFlow.test.tsx` (formulário → chamada à API → redirecionamento para `/dashboard`; cenário de falha de login). Para testes manuais ou E2E sem backend real, use a API fake (`npm run fake-api` em `apps/backend`).

Estrutura de testes do backend:

```
apps/backend/src/tests/
├── config/           # Configuração de banco para testes (database.test.ts)
├── controllers/      # Testes de controllers (Account, Category, CreditCard, Goal, Report, Transaction, User)
├── integration/      # Testes de integração (authRoutes, insightsRoutes)
├── middlewares/      # Testes de middlewares (auth, error, validation)
├── repositories/     # Testes de repositórios (Account, Category, CreditCard, Goal, Investment, Subscription, Transaction, User)
├── services/         # Testes de serviços (Account, AIAnalysis, Billing, Category, CreditCard, Goal, Investment, Notification, Report, StripePayment, Subscription, Token, Transaction, User)
├── utils/            # Testes de utilitários (ApiError, ApiResponse, pkce, ProcessCallback, TokenUtils, TransactionManager)
├── validators/       # Testes de validadores (account, category, creditCard, goal, investment, transaction, user)
└── setup.ts          # Configuração global do Jest
```

## 🛣️ Roadmap

Consulte **docs/ROADMAP-EXECUTIVO.md** para o roadmap completo. Resumo do estado atual:

- **Fase 1 (Fundação IA)** e **Fase 2 (Consultor e Chat)** — concluídas
- **Fase 3 (WhatsApp)** — concluída (webhook Twilio, parser híbrido regex+IA, vinculação de telefone, testes com cenários reais)
- **Fase 4 (Extensões)** — próxima (categorização automática com IA, notificações inteligentes, dashboard de tendências, etc.)

### Funcionalidades Implementadas

**Backend**
- ✅ Autenticação segura com JWT e refresh tokens
- ✅ Login via redes sociais com Passport.js (Google, GitHub)
- ✅ Cookies HttpOnly e sessões com express-session
- ✅ Proteção CSRF com state parameter e PKCE
- ✅ CRUD de contas, categorias, transações, metas, cartões de crédito e investimentos
- ✅ Relatórios financeiros (PDF e Excel)
- ✅ Insights de IA: score financeiro, recomendações e tendências
- ✅ **Planejamento financeiro**: plano, simulador e aderência (FinancialPlanningService)
- ✅ **Consultor IA**: chat com contexto do usuário, sessões e histórico (FinancialConsultantService)
- ✅ **WhatsApp**: webhook Twilio com validação X-Twilio-Signature, parser híbrido (regex + IA), criação de transação por mensagem (WhatsAppTransactionService)
- ✅ Sistema de assinaturas (Free e Premium) e Stripe
- ✅ Upload de avatar e anexos em transações (Multer)
- ✅ Rotas de arquivos: avatar, anexos e download
- ✅ Injeção de dependência (TSyringe), interfaces e validação (Zod)
- ✅ Middleware premium para recursos exclusivos
- ✅ Notificações (MockNotificationService, Nodemailer, Twilio)
- ✅ Documentação Swagger em `/api-docs`

**Frontend (Next.js 15 / React 19)**
- ✅ App Router com rotas privadas e públicas
- ✅ Dashboard com gráficos (fluxo de caixa, despesas, transações recentes)
- ✅ Páginas: Carteira, Contas, Cartões de Crédito, Transações, Metas, Investimentos, Insights, Relatórios, **Planejamento**, **Consultor IA**, Perfil, Configurações
- ✅ **Chat flutuante** com toggle "Usar meus dados" nas páginas privadas
- ✅ **Vinculação de WhatsApp** no perfil (Configurações → Perfil → Telefone)
- ✅ Autenticação: login, registro, verificação de e-mail, recuperação e redefinição de senha
- ✅ Login social (Google, GitHub) e callback
- ✅ Tema claro/escuro (next-themes)
- ✅ TanStack React Query para dados e cache
- ✅ Formulários com React Hook Form + Zod
- ✅ UI com Radix UI, shadcn-ui, Recharts, Sonner (toast)
- ✅ Middleware de proteção de rotas e redirecionamento

### Correções Recentes (v1.2.0)

- ✅ **Sistema de Autenticação Corrigido**: Erro 401 no registro/login resolvido
- ✅ **Google OAuth Funcionando**: Implementação com Passport.js
- ✅ **GitHub OAuth Funcionando**: Callback e redirecionamento corrigidos
- ✅ **Facebook OAuth Removido**: Simplificação para Google e GitHub apenas
- ✅ **Loading Infinito Corrigido**: Redirecionamento automático para dashboard
- ✅ **Middleware de Autenticação**: Suporte a userId corrigido
- ✅ **Logs de Debug Removidos**: Código limpo para produção
- ✅ **Autenticação com cookie HttpOnly**: Token apenas no backend; cliente não acessa token (mitigação XSS)
- ✅ **Teste de fluxo de login no frontend**: Jest + React Testing Library em `components/auth/__tests__/loginFlow.test.tsx`
- ✅ **API fake com Faker**: Script `npm run fake-api` no backend para testes offline (login/perfil/logout sem MongoDB)

### Próximos Passos (Fase 4 – Extensões)

- 🔲 **F4-01** Categorização automática com IA
- 🔲 **F4-02** Notificações inteligentes e proativas
- 🔲 **F4-03** Dashboard de tendências e previsões
- 🔲 **F4-04** Regras e automações básicas
- 🔲 **F4-05** Análise de comprovantes (OCR/IA)
- 🔲 **F4-06** Ajustes de UX e performance

Outros: importação de extratos, CI/CD (GitHub Actions), aplicativo mobile, Open Banking — ver **docs/ROADMAP-EXECUTIVO.md**.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
3. Faça commit das alterações: `git commit -m 'Adiciona nova feature'`
4. Envie para o repositório: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

### Convenções de Código

- Utilize TypeScript para todos os arquivos
- Siga o estilo de código configurado no ESLint
- Escreva testes para novas funcionalidades
- Documente novos endpoints na documentação da API

## 📄 Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes.

---

Desenvolvido por Matheus Queiroz
