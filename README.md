# OrganFinancialAI 🚀

![OrganFinancialAI Logo](https://via.placeholder.com/300x100?text=OrganFinancialAI)

OrganFinancialAI é uma plataforma completa de gestão financeira pessoal com recursos avançados de inteligência artificial para análise de gastos, orçamentos e planejamento financeiro.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

## 📑 Índice

- [Visão Geral](#-visão-geral)
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

## 👁️ Visão Geral

OrganFinancialAI é uma solução completa para gestão de finanças pessoais com análise inteligente de dados financeiros. A plataforma permite aos usuários rastrear receitas, despesas, definir metas financeiras, gerenciar contas e receber insights personalizados baseados em padrões de gastos. Com inteligência artificial integrada, fornecemos recomendações personalizadas para ajudar os usuários a melhorar sua saúde financeira.

### Diferenciais

- **Análise Inteligente**: Algoritmos de IA analisam os padrões de gastos e fornecem recomendações personalizadas
- **Visualização de Dados**: Dashboards interativos para visualizar o fluxo financeiro
- **Multi-plataforma**: Disponível em web e futuras versões mobile
- **Segurança**: Dados criptografados e práticas seguras de autenticação

## 🚀 Recursos

### Gestão Financeira

- Rastreamento de transações (receitas, despesas, investimentos)
- Categorização inteligente de transações
- Gestão de contas bancárias e saldos
- Planejamento e acompanhamento de metas financeiras
- Relatórios financeiros personalizados
- Upload de anexos e recibos de transações

### Recursos de IA

- Análise de padrões de gastos
- Recomendações para otimização de despesas
- Previsões financeiras baseadas em histórico
- Score financeiro pessoal
- Sugestões para melhorar saúde financeira

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

### Autenticação

- Cadastro e login tradicionais
- Login via redes sociais (Google, Facebook, Twitter)
- Autenticação JWT
- Recuperação de senha

## 💻 Tecnologias

### Backend

- **Node.js**: Ambiente de execução JavaScript
- **TypeScript**: Extensão tipada de JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT**: Autenticação baseada em tokens
- **Zod**: Validação de esquemas
- **Bcrypt**: Hashing de senhas
- **PDFKit/ExcelJS**: Geração de relatórios em PDF e Excel
- **Stripe**: Gateway de pagamento
- **Passport**: Estratégias de autenticação social
- **Jest**: Framework de testes
- **TSyringe**: Injeção de dependência
- **Multer**: Upload de arquivos

### DevOps

- **Docker**: Containerização
- **Docker Compose**: Orquestração de containers
- **Turborepo**: Gerenciamento de monorepo
- **GitHub Actions**: CI/CD (planejado)

## 📐 Arquitetura

OrganFinancialAI segue uma arquitetura moderna baseada em princípios sólidos de engenharia de software:

### Estrutura de Monorepo

O projeto utiliza Turborepo para gerenciar um monorepo com múltiplos pacotes:

```
organfinancialai/
├── apps/
│   ├── backend/    # API REST em Node.js/Express
│   ├── web/        # Frontend web (planejado)
│   └── mobile/     # App mobile (planejado)
└── packages/
    ├── eslint-config/  # Configurações compartilhadas de ESLint
    ├── typescript-config/  # Configurações compartilhadas de TypeScript
    └── ui/         # Componentes de UI compartilhados (planejado)
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

#### Autenticação

| Método | Endpoint              | Descrição                         |
| ------ | --------------------- | --------------------------------- |
| POST   | `/api/users/register` | Registrar novo usuário            |
| POST   | `/api/users/login`    | Login de usuário                  |
| GET    | `/api/auth/google`    | Iniciar autenticação via Google   |
| GET    | `/api/auth/facebook`  | Iniciar autenticação via Facebook |
| GET    | `/api/auth/twitter`   | Iniciar autenticação via Twitter  |

#### Usuários

| Método | Endpoint                     | Descrição                   |
| ------ | ---------------------------- | --------------------------- |
| GET    | `/api/users/profile`         | Obter perfil do usuário     |
| PUT    | `/api/users/profile`         | Atualizar perfil do usuário |
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

#### Relatórios

| Método | Endpoint                | Descrição                  |
| ------ | ----------------------- | -------------------------- |
| GET    | `/api/reports/generate` | Gerar relatório financeiro |
| GET    | `/api/reports/insights` | Obter insights de IA       |

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
JWT_EXPIRES_IN=24h

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

# Autenticação Social
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
FACEBOOK_CLIENT_ID=seu_app_id
FACEBOOK_CLIENT_SECRET=seu_app_secret
TWITTER_CLIENT_ID=sua_api_key
TWITTER_CLIENT_SECRET=sua_api_secret
```

## 🏁 Instalação e Execução

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/organfinancialai.git
cd organfinancialai

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Usando Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/organfinancialai.git
cd organfinancialai

# Inicie os contêineres
docker-compose up -d

# Para parar os contêineres
docker-compose down
```

## 🧪 Testes

O projeto usa Jest para testes automatizados.

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

Estrutura de testes:

```
apps/backend/
└── tests/
    ├── integration/  # Testes de integração
    └── services/     # Testes unitários de serviços
        ├── AccountService.test.ts
        ├── TransactionService.test.ts
        ├── UserService.test.ts
        └── ...
```

## 🛣️ Roadmap

### Funcionalidades Implementadas

- ✅ Autenticação e gerenciamento de usuários
- ✅ CRUD de contas, categorias, transações e metas
- ✅ Relatórios financeiros (PDF e Excel)
- ✅ Insights baseados em IA
- ✅ Sistema de assinaturas (Free e Premium)
- ✅ Integração com Stripe para pagamentos
- ✅ Login via redes sociais
- ✅ Upload de anexos para transações

### Próximos Passos

#### Curto Prazo (1-3 meses)

- 🔲 Frontend web em React
- 🔲 Melhorias na análise de IA
- 🔲 Dashboard interativo
- 🔲 Importação de extratos bancários
- 🔲 Melhorias nos testes automatizados
- 🔲 CI/CD com GitHub Actions

#### Médio Prazo (3-6 meses)

- 🔲 Aplicativo mobile (React Native)
- 🔲 Integração com Open Banking
- 🔲 Funcionalidades de planejamento orçamentário
- 🔲 Notificações por e-mail e push
- 🔲 Aprimoramentos de UX/UI

#### Longo Prazo (6+ meses)

- 🔲 Marketplace de ferramentas financeiras
- 🔲 Integração com corretoras de investimentos
- 🔲 Versão para pequenas empresas
- 🔲 Funcionalidades sociais (comparação anônima, dicas compartilhadas)
- 🔲 Expansão internacional e multilíngue

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

Desenvolvido com ❤️ pela equipe OrganFinancialAI
