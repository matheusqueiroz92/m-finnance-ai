OrganFinancialAI - API Backend
Um sistema avançado de gestão financeira pessoal com recursos de inteligência artificial para análise de gastos, orçamentos e planejamento financeiro.
📑 Índice

Visão Geral
Recursos
Tecnologias
Começando
Estrutura do Projeto
API Endpoints
Configuração do Ambiente
Contribuindo
Licença

👁️ Visão Geral
OrganFinancialAI é uma solução completa para gestão de finanças pessoais com análise inteligente de dados financeiros. O sistema permite aos usuários rastrear receitas, despesas, definir metas financeiras, gerenciar contas e receber insights personalizados baseados em padrões de gastos.
🚀 Recursos
Gestão Financeira

Rastreamento de transações (receitas, despesas, investimentos)
Categorização inteligente de transações
Gestão de contas bancárias e saldos
Planejamento de metas financeiras
Relatórios financeiros personalizados

Recursos de IA

Análise de padrões de gastos
Recomendações para otimização de despesas
Previsões financeiras baseadas em histórico
Score financeiro pessoal
Sugestões para melhorar saúde financeira

Relatórios e Exportação

Dashboards interativos com visualizações
Relatórios detalhados por categoria e período
Exportação em PDF e Excel
Análises comparativas mês a mês

💻 Tecnologias
Backend

Node.js: Ambiente de execução JavaScript
TypeScript: Extensão tipada de JavaScript
Express: Framework web para Node.js
MongoDB: Banco de dados NoSQL
Mongoose: ODM (Object Data Modeling) para MongoDB
JWT: Autenticação baseada em tokens
Zod: Validação de esquemas
Bcrypt: Hashing de senhas
PDFKit/ExcelJS: Geração de relatórios em PDF e Excel
Jest: Framework de testes

DevOps

Docker: Containerização
Docker Compose: Orquestração de containers
Turborepo: Gerenciamento de monorepo

🏁 Começando
Pré-requisitos

Node.js (v18+)
npm ou yarn
Docker e Docker Compose (para ambiente containerizado)
MongoDB (para desenvolvimento local sem Docker)

Instalação

Clone o repositório:

bashgit clone https://github.com/seunome/organfinancialai.git
cd organfinancialai

Instale as dependências:

bashnpm install

Configure as variáveis de ambiente:

bashcp .env.example .env

# Edite o arquivo .env com suas configurações

Inicie a aplicação em modo de desenvolvimento:

bashnpm run dev
Usando Docker

Inicie os containers:

bashdocker-compose up -d

Para parar os containers:

bashdocker-compose down
📂 Estrutura do Projeto
apps/backend/
├── src/
│ ├── config/ # Configurações (banco de dados, JWT, etc.)
│ ├── controllers/ # Controladores da API
│ ├── interfaces/ # Interfaces e tipos TypeScript
│ ├── middlewares/ # Middlewares Express
│ ├── models/ # Modelos de dados
│ ├── routes/ # Rotas da API
│ ├── schemas/ # Esquemas Mongoose
│ ├── services/ # Serviços de negócio
│ ├── utils/ # Funções utilitárias
│ ├── validators/ # Validadores de entrada (Zod)
│ ├── app.ts # Configuração da aplicação Express
│ └── server.ts # Ponto de entrada da aplicação
├── tests/ # Testes automatizados
├── uploads/ # Diretório para arquivos enviados
├── dist/ # Código compilado (gerado no build)
├── Dockerfile # Configuração Docker
└── package.json # Dependências e scripts
🔌 API Endpoints
Autenticação

POST /api/users/register - Registrar novo usuário
POST /api/users/login - Login de usuário

Usuários

GET /api/users/profile - Obter perfil do usuário
PUT /api/users/profile - Atualizar perfil
POST /api/users/change-password - Alterar senha

Transações

POST /api/transactions - Criar transação
GET /api/transactions - Listar transações
GET /api/transactions/stats - Estatísticas de transações
GET /api/transactions/:id - Obter transação por ID
PUT /api/transactions/:id - Atualizar transação
DELETE /api/transactions/:id - Excluir transação

Contas

POST /api/accounts - Criar conta
GET /api/accounts - Listar contas
GET /api/accounts/summary - Resumo de contas
GET /api/accounts/:id - Obter conta por ID
PUT /api/accounts/:id - Atualizar conta
DELETE /api/accounts/:id - Excluir conta

Categorias

POST /api/categories - Criar categoria
GET /api/categories - Listar categorias
GET /api/categories/:id - Obter categoria por ID
PUT /api/categories/:id - Atualizar categoria
DELETE /api/categories/:id - Excluir categoria

Metas

POST /api/goals - Criar meta
GET /api/goals - Listar metas
GET /api/goals/stats - Estatísticas de metas
GET /api/goals/:id - Obter meta por ID
PUT /api/goals/:id - Atualizar meta
DELETE /api/goals/:id - Excluir meta

Relatórios

GET /api/reports/generate - Gerar relatório financeiro
GET /api/reports/insights - Obter insights de IA

⚙️ Configuração do Ambiente
Variáveis de Ambiente
dotenv# Servidor
PORT=3001
NODE_ENV=development

# MongoDB

MONGODB_URI=mongodb://localhost:27017/organfinancialai

# JWT (Autenticação)

JWT_SECRET=seu_segredo_jwt_aqui
JWT_EXPIRES_IN=24h

# Email (Nodemailer)

SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=seu_email@exemplo.com
SMTP_PASS=sua_senha

# Twilio (Opcional - para notificações WhatsApp)

TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_twilio
🤝 Contribuindo

Faça um fork do projeto
Crie sua branch de feature (git checkout -b feature/amazing-feature)
Commit suas mudanças (git commit -m 'Add some amazing feature')
Push para a branch (git push origin feature/amazing-feature)
Abra um Pull Request

Convenções de Código

Utilize TypeScript para todos os arquivos
Siga o estilo de código do ESLint configurado
Escreva testes para novas funcionalidades
Documente novos endpoints na documentação da API

📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.
