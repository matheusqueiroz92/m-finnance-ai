# M. Finnance AI — Frontend (Web)

Interface web da plataforma M. Finnance AI, construída com **Next.js 15**, **React 19** e **TypeScript**, usando App Router, Turbopack, TanStack React Query e componentes baseados em Radix UI / shadcn-ui.

## Índice

- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas e Páginas](#-rotas-e-páginas)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Docker](#-docker)

## 🛠 Tecnologias

| Tecnologia                      | Uso                                                         |
| ------------------------------- | ----------------------------------------------------------- |
| **Next.js 15**                  | Framework React (App Router, Turbopack)                     |
| **React 19**                    | Interface de usuário                                        |
| **TypeScript**                  | Tipagem estática                                            |
| **TanStack React Query**        | Cache, sincronização e estado de dados (API)                |
| **React Hook Form + Zod**       | Formulários e validação                                     |
| **Radix UI / shadcn-ui**        | Componentes acessíveis                                      |
| **Tailwind CSS 4**              | Estilização                                                 |
| **Recharts**                    | Gráficos (dashboard, investimentos)                         |
| **next-themes**                 | Tema claro/escuro                                           |
| **Sonner**                      | Notificações toast                                          |
| **Lucide React**                | Ícones                                                      |
| **date-fns / react-day-picker** | Datas                                                       |
| **Axios**                       | Cliente HTTP para a API                                     |
| **js-cookie / jwt-decode**      | Autenticação (cookies, token)                               |
| **ExcelJS / jsPDF**             | Exportação de relatórios no cliente                         |
| **@repo/ui**                    | Componentes compartilhados do monorepo (Button, Card, Code) |

## 📁 Estrutura do Projeto

```
apps/web/src/
├── app/
│   ├── (private)/              # Rotas autenticadas (layout com Sidebar + Header)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── wallet/
│   │   ├── credit-cards/
│   │   ├── transactions/
│   │   ├── goals/
│   │   ├── investments/
│   │   ├── insights/
│   │   ├── reports/
│   │   ├── profile/
│   │   └── settings/
│   ├── (public)/               # Rotas públicas (auth, termos, contato)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── verify-email-token/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── contact/
│   │   ├── terms-service/
│   │   ├── privacy-policies/
│   │   ├── auth/success/
│   │   └── auth/social-callback/
│   ├── layout.tsx
│   ├── page.tsx                 # Redireciona para /dashboard ou /login
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── accounts/                # Lista, resumo, modais de criar/atualizar
│   ├── auth/                    # Login, registro, verificação, recuperação de senha
│   ├── credit-cards/            # Lista, resumo, transações, modais
│   ├── dashboard/               # Gráficos, resumo, transações recentes
│   ├── goals/                   # Lista, estatísticas, modais
│   ├── insights/                # Score financeiro, progresso de metas, lista de insights
│   ├── investments/             # Lista, desempenho, portfólio, modais
│   ├── layout/                  # AppLayout, SideBar, Header, Footer, PageLayout
│   ├── providers/               # QueryProvider, ThemeProvider, RouteChangeProvider, ToastProvider
│   ├── settings/                # Categorias, perfil, notificações, segurança
│   ├── shared/                  # ConfirmDialog, CurrencyInput, EmptyState, InputMask
│   ├── transactions/            # Tabela, filtros, modal de criar
│   ├── ui/                       # Componentes base (shadcn: button, card, dialog, form, etc.)
│   └── wallet/                  # Lista de contas e resumo (carteira)
├── hooks/                       # useAccountsData, useDashboardData, useTransactionsData, etc.
├── lib/
│   ├── api/axios.ts             # Instância Axios (base URL, cookies)
│   ├── auth.tsx                 # AuthProvider, useAuth
│   ├── constants/api-routes.ts  # Rotas da API
│   ├── constants/query-keys.ts
│   ├── errors.tsx
│   ├── utils.ts
│   └── validators/              # Schemas Zod por domínio
├── middleware.ts                # Proteção de rotas (token, redirecionamento)
├── services/                     # accountService, authService, transactionService, etc.
└── types/                        # Tipos por domínio (user, transaction, account, etc.)
```

## 🗺 Rotas e Páginas

### Rotas privadas (exigem autenticação)

| Rota            | Descrição                                                               |
| --------------- | ----------------------------------------------------------------------- |
| `/dashboard`    | Visão geral, gráficos de fluxo de caixa e despesas, transações recentes |
| `/accounts`     | Gerenciamento de contas bancárias                                       |
| `/wallet`       | Carteira (contas e resumo)                                              |
| `/credit-cards` | Cartões de crédito e faturas                                            |
| `/transactions` | Listagem e filtros de transações                                        |
| `/goals`        | Metas financeiras                                                       |
| `/investments`  | Investimentos e desempenho                                              |
| `/insights`     | Insights de IA (score, recomendações, tendências)                       |
| `/reports`      | Relatórios e exportação                                                 |
| `/profile`      | Perfil do usuário                                                       |
| `/settings`     | Configurações (categorias, notificações, segurança)                     |

### Rotas públicas

| Rota                    | Descrição                                  |
| ----------------------- | ------------------------------------------ |
| `/login`                | Login (e-mail/senha e OAuth Google/GitHub) |
| `/register`             | Cadastro                                   |
| `/verify-email`         | Verificação de e-mail                      |
| `/verify-email-token`   | Verificação por token                      |
| `/forgot-password`      | Recuperação de senha                       |
| `/reset-password`       | Redefinição de senha                       |
| `/contact`              | Contato / suporte                          |
| `/terms-service`        | Termos de uso                              |
| `/privacy-policies`     | Política de privacidade                    |
| `/auth/success`         | Página de sucesso pós-login                |
| `/auth/social-callback` | Callback OAuth                             |

A raiz (`/`) redireciona para `/dashboard` se autenticado, ou para `/login` caso contrário.

## ⚙️ Configuração

### Requisitos

- Node.js 18+
- npm ou yarn
- Backend da API rodando (por padrão em `http://localhost:3001`)

### Variáveis de ambiente

Crie um arquivo `.env.local` em `apps/web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Em produção, defina a URL da API conforme o ambiente.

## 🏁 Execução

Na raiz do monorepo (sobe backend e web):

```bash
npm run dev
```

Apenas o frontend:

```bash
cd apps/web
npm install
npm run dev
```

A aplicação sobe em **http://localhost:3000** (Turbopack ativo por padrão).

Build para produção:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## 🐳 Docker

O frontend pode ser executado como serviço do Docker Compose a partir da raiz do projeto. O serviço `web` escuta na porta **3000** e usa a variável `NEXT_PUBLIC_API_URL` apontando para o backend. Consulte o [README principal](../../README.md) para uso completo.

---

Para visão geral do projeto, API e backend, veja o [README principal](../../README.md) e o [README do backend](../backend/README.md).
