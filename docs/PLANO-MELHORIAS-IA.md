# Plano de Melhorias - M. Finnance AI
## Transformando em Plataforma Financeira Moderna com IA Avançada

> Documento elaborado para orientar o desenvolvimento de funcionalidades avançadas com IA e integrações diferenciadas, mantendo os padrões existentes (MSC, Repository Pattern, TSyringe, TDD).

---

## 📋 Sumário Executivo

Este plano visa transformar o M. Finnance AI de uma aplicação convencional de gestão financeira em uma **plataforma moderna e diferenciada**, com foco em:

1. **IA Avançada** – Análises inteligentes, consultor virtual e chat
2. **WhatsApp como Canal de Entrada** – Cadastro rápido de despesas via mensagens
3. **Recomendações Personalizadas** – Investimentos, planejamento e otimização
4. **Outras Melhorias** – UX, automações e extensibilidade

---

## 🎯 Funcionalidades Prioritárias (Solicitadas)

### 1. Análise Inteligente de Gastos

**Estado atual:** Já existe `AIAnalysisService` com `generateInsights`, score financeiro e métricas.

**Melhorias planejadas:**
- Detecção de anomalias (gastos atípicos em relação ao padrão histórico)
- Identificação automática de padrões de consumo (ex.: gastos com delivery às sextas-feiras)
- Previsão de gastos do próximo mês baseada em séries temporais
- Comparativo com perfis similares (anonimizado)
- Alertas proativos quando o gasto em uma categoria ultrapassar o habitual

**Arquivos impactados:**
- `apps/backend/src/services/AIAnalysisService.ts`
- `apps/backend/src/interfaces/services/IAIAnalysisService.ts`
- `apps/web/src/components/insights/*`
- `apps/web/src/app/(private)/insights/page.tsx`

---

### 2. Sugestões de Investimentos

**Estado atual:** Existe módulo de investimentos (CRUD) e um insight genérico de investimento.

**Melhorias planejadas:**
- Recomendações de alocação baseadas em perfil (conservador, moderado, arrojado)
- Sugestões de ativos considerando:
  - Taxa de poupança
  - Metas financeiras
  - Horizonte de tempo
  - Diversificação atual
- Indicadores de oportunidades (ex.: reserva de emergência completa → sugerir renda fixa/ variável)
- Integração com dados de rentabilidade (APIs públicas ou mock inicial)

**Arquivos impactados:**
- Novo: `apps/backend/src/services/InvestmentRecommendationService.ts`
- Novo: `apps/backend/src/interfaces/services/IInvestmentRecommendationService.ts`
- `apps/backend/src/controllers/ReportController.ts` ou novo `InvestmentController`
- `apps/web/src/app/(private)/investments/page.tsx`
- Novo componente: `InvestmentRecommendations.tsx`

---

### 3. Planejamento Financeiro com IA

**Estado atual:** Metas financeiras existem; planejamento é manual.

**Melhorias planejadas:**
- Geração de plano financeiro personalizado (50/30/20 ou customizado)
- Sugestão de metas baseada em objetivos de vida (casa própria, aposentadoria, viagem)
- Simulador de cenários: “e se eu poupar X% por Y meses?”
- Cronograma de execução com marcos e checkpoints
- Acompanhamento de aderência ao plano com feedback da IA

**Arquivos impactados:**
- Novo: `apps/backend/src/services/FinancialPlanningService.ts`
- Novo: `apps/backend/src/interfaces/services/IFinancialPlanningService.ts`
- `apps/web/src/app/(private)/goals/page.tsx`
- Novo: `apps/web/src/app/(private)/planning/page.tsx`
- Componentes: `FinancialPlanCard`, `PlanSimulator`, `AdherenceTracker`

---

### 4. Consultor Financeiro de IA

**Estado atual:** Não existe.

**Melhorias planejadas:**
- Assistente virtual com contexto financeiro do usuário
- Respostas sobre:
  - Interpretação do score
  - Como reduzir gastos em uma categoria
  - Quando investir vs. quitar dívidas
  - Ajuste de metas
- Interface de chat conversacional na área privada
- Histórico de conversas (por sessão ou persistido)
- Possível uso de function calling para consultar dados em tempo real (contas, transações, metas)

**Arquivos impactados:**
- Novo: `apps/backend/src/services/FinancialConsultantService.ts`
- Novo: `apps/backend/src/interfaces/services/IFinancialConsultantService.ts`
- Novo: `apps/backend/src/routes/consultantRoutes.ts`
- Novo: `apps/backend/src/controllers/ConsultantController.ts`
- Novo: `apps/web/src/app/(private)/consultant/page.tsx`
- Componentes: `ConsultantChat`, `MessageList`, `ConsultantInput`

---

### 5. Chat de IA para Dúvidas Gerais

**Estado atual:** Não existe.

**Melhorias planejadas:**
- Chat aberto para perguntas sobre finanças pessoais (sem necessariamente acessar dados do usuário)
- Tópicos: educação financeira, conceitos, dicas genéricas
- Possível toggle: “Usar meus dados” para respostas personalizadas (reutilizando o Consultor)
- Acessível em qualquer tela (modal ou sidebar flutuante)
- Histórico opcional e exportável

**Arquivos impactados:**
- Pode ser uma extensão do `FinancialConsultantService` com `useUserContext: boolean`
- Novo: `apps/backend/src/routes/chatRoutes.ts`
- Componente global: `FloatingAIChat` ou `AIChatSidebar`
- `apps/web/src/app/(private)/layout.tsx` (incluir o componente flutuante)

---

### 6. Integração WhatsApp – Entrada de Dados

**Estado atual:** Twilio configurado apenas para **envio** de notificações.

**Melhorias planejadas:**
- Webhook para receber mensagens do WhatsApp via Twilio
- Vinculação de número de telefone ao usuário (configuração em perfil)
- Processamento de mensagens com NLP/IA para extrair:
  - Valor (ex.: R$ 45,90; 45 reais)
  - Descrição (ex.: almoço, uber, mercado)
  - Categoria (inferida ou default)
  - Data (hoje, ontem, 15/03)
- Criação automática de transação na conta padrão do usuário
- Resposta via WhatsApp confirmando o lançamento
- Tratamento de erros e mensagens malformadas com feedback amigável

**Exemplos de mensagens suportadas:**
- `almoço 45,90`
- `uber 22 - ontem`
- `gastei 150 no mercado hoje`
- `despesa: farmácia 89,50`

**Arquivos impactados:**
- Novo: `apps/backend/src/services/WhatsAppTransactionService.ts`
- Novo: `apps/backend/src/interfaces/services/IWhatsAppTransactionService.ts`
- Novo: `apps/backend/src/controllers/WhatsAppWebhookController.ts`
- Novo: `apps/backend/src/routes/whatsappRoutes.ts` (webhook público, sem auth tradicional)
- Novo: `apps/backend/src/utils/ExpenseMessageParser.ts` (ou IA para classificação)
- `apps/backend/src/schemas/UserSchema.ts` – campo `phone` e `whatsappVerified`
- `apps/web/src/app/(private)/settings/page.tsx` – seção “Vincular WhatsApp”
- `app.ts` – rota webhook precisa de `express.urlencoded` (raw body para validação Twilio)
- Validação de assinatura Twilio (`X-Twilio-Signature`)

---

## 💡 Outras Melhorias Sugeridas

### 7. Categorização Automática de Transações com IA

- Usar descrição + histórico para sugerir/definir categoria
- Aprendizado contínuo: feedback do usuário melhora sugestões
- Redução de esforço manual na importação de extratos

### 8. Notificações Inteligentes e Proativas

- Alertas quando um gasto incomum for detectado
- Lembretes de metas próximas (ex.: “Faltam R$ 200 para sua meta de férias”)
- Resumo semanal por WhatsApp com principais números
- Integrar com o sistema de notificações já existente (Nodemailer + Twilio)

### 9. Dashboard de Tendências e Previsões

- Gráficos de previsão de saldo (próximos 3–6 meses)
- Curva de progresso em metas com projeção de conclusão
- Heatmap de gastos por dia da semana / hora
- Comparativo mês a mês com insights automáticos

### 10. Análise de Comprovantes (OCR + IA)

- Upload de foto de nota fiscal ou comprovante
- Extração de valor, data, estabelecimento via OCR/IA
- Pré-preenchimento de formulário de transação
- Possível integração com OpenAI Vision ou serviço dedicado

### 11. Regras e Automações

- Regras do tipo: “Se gasto em X > Y, notificar”
- Automação: “Todo gasto com Uber vai para categoria Transporte”
- Orçamento por categoria com alertas ao atingir limite
- Integração com sistema de categorias existente

### 12. Modo Offline / PWA

- Cache de dados essenciais para uso offline
- Fila de transações pendentes para sincronização
- PWA com service worker para instalação no celular
- Melhora a experiência em conexões instáveis

### 13. Gamificação e Motivação

- Conquistas (badges) por metas atingidas
- Níveis de usuário baseados em consistência
- Comparativo de evolução ao longo do tempo
- Integração com metas e insights

### 14. Open Banking (Médio/Longo Prazo)

- Conexão com bancos via APIs reguladas
- Importação automática de transações
- Atualização de saldos em tempo real
- Requer cadastro em instituição reguladora

### 15. Multi-idioma e Acessibilidade

- i18n para suporte a PT-BR, EN, ES
- Melhorias de acessibilidade (ARIA, contraste, foco)
- Compatibilidade com leitores de tela

### 16. Previsão de Fluxo de Caixa com IA

- Projeção de saldo dos próximos 3–6 meses
- Considerar despesas recorrentes, metas e receitas previstas
- Alertas de possíveis saldos negativos
- Dashboard visual de fluxo de caixa projetado

### 17. Simulador de Aposentadoria

- Projeção com IA baseada em: idade, aportes mensais, taxa de retorno esperada
- Cenários: conservador, moderado, arrojado
- Comparativo com gastos projetados na aposentadoria
- Sugestão de ajuste de aportes para meta desejada

### 18. Integração Telegram (Alternativa ao WhatsApp)

- Canal paralelo para usuários que preferem Telegram
- Mesma lógica de parser de despesas via mensagem
- Bot com comandos inline para consultas rápidas

### 19. Detecção de Assinaturas Ocultas e "Dark Patterns"

- IA para identificar gastos recorrentes que passam despercebidos
- Alertas: "Você tem 8 assinaturas ativas – total R$ X/mês"
- Sugestão de cancelamento de assinaturas não utilizadas
- Relatório de "vazamentos" financeiros

### 20. Split de Despesas e Modo Compartilhado

- Divisão de contas entre pessoas (ex.: aluguel, viagem)
- Orçamento familiar compartilhado (opcional)
- Metas conjuntas e visibilidade controlada
- Permissões granulares por membro

### 21. Benchmark Anonimizado e Comparativos

- Comparativo de gastos com perfis similares (idade, renda, região)
- "Você gasta X% a mais em alimentação que a média"
- Métricas de referência por categoria (percentis)
- Privacidade garantida – apenas médias agregadas

### 22. Assistente de Voz (Comandos por Voz)

- "Adicionar despesa de R$ 50 em almoço"
- Integração com Web Speech API ou provedor de STT
- Respostas em áudio para consultas rápidas
- Acessível em PWA no celular

### 23. Relatórios Exportáveis com Análise de IA

- PDF/Excel com análise narrativa personalizada
- Resumo executivo gerado por IA
- Gráficos + insights em texto corrido
- Envio automático por e-mail (mensal, trimestral)

### 24. Ajuste pela Inflação

- Metas e projeções ajustadas por IPCA
- "Sua meta de R$ 50.000 em 5 anos equivale a R$ X em poder de compra"
- Histórico de gastos em valores reais vs. nominais

### 25. Sugestão de Corte de Gastos por IA

- Recomendações objetivas: "Reduza X em categoria Y e economize R$ Z/mês"
- Priorização por impacto (maior economia primeiro)
- Integração com insights existentes e categorias de gastos

### 26. Metas Dinâmicas

- Recalcular prazos e valores sugeridos conforme o comportamento do usuário
- Ajuste automático de metas quando padrão de gastos muda
- Feedback da IA sobre viabilidade em tempo real

### 27. Reconciliação Bancária Assistida

- IA auxilia a associar transações importadas a lançamentos manuais
- Sugestões de correspondência (matches) com base em valor, data e descrição
- Reduz esforço na importação de extratos e conciliação

### 28. Modo Voz no WhatsApp

- Processar áudio de despesas via Speech-to-Text
- Usuário envia áudio: "Gastei 50 reais no almoço" → transação criada
- Complementa o parser de texto para maior acessibilidade

### 29. Painel de Saúde Financeira

- Score visual unificado com indicadores e tendência em tempo (quase) real
- Métricas consolidadas: poupança, endividamento, progresso em metas
- Widget destacado no dashboard principal

### 30. Feedback do Usuário para IA

- Botões "Útil" / "Não útil" em respostas do consultor e insights
- Dados utilizados para melhorar prompts e futuros modelos
- Métricas de satisfação e iteração contínua

---

## 🏗️ Considerações de Arquitetura

### Segurança

- **Webhook WhatsApp:** Sempre validar `X-Twilio-Signature` antes de processar
- **Consultor:** Garantir isolamento total de dados entre usuários; evitar vazamento de contexto
- **Dados sensíveis:** Nunca enviar para logs ou métricas; mascarar em ambientes não-produção

### Custos (OpenAI)

- Usar `gpt-4o-mini` para tarefas leves (parser, categorização, insights)
- Usar `gpt-4o` para consultor e respostas complexas
- Implementar cache de insights (ex.: 24h) para reduzir chamadas repetidas

### Infraestrutura

- Webhook exposto em HTTPS (obrigatório em produção)
- Fila de jobs (Bull/BullMQ) para processamento assíncrono de mensagens WhatsApp em pico
- Rate limiting em endpoints de chat/consultor para evitar abuso

---

## 📐 Arquitetura e Padrões

### Princípios a Seguir

1. **MSC (Model, Service, Controller)** – Manter estrutura existente
2. **Repository Pattern** – Novos domínios seguem o mesmo padrão
3. **Injeção de Dependências (TSyringe)** – Registrar novos serviços no `container.ts`
4. **Interfaces** – Toda camada de serviço com interface em `interfaces/services/`
5. **TDD** – Testes antes ou em paralelo ao código (Jest, Mocha, Chai, Supertest)
6. **Zod** – Validação de payloads em novas rotas
7. **Swagger** – Documentar novos endpoints
8. **ShadCN/ui + Tailwind** – Novos componentes frontend
9. **React Hook Form + Zod** – Formulários no frontend
10. **TanStack Query** – Queries e mutações para novos dados

### Estrutura para Novos Módulos

```
apps/backend/src/
├── controllers/   # NovoController.ts
├── services/      # NovoService.ts
├── repositories/  # NovoRepository.ts (se houver persistência específica)
├── interfaces/
│   ├── services/  # INovoService.ts
│   └── entities/  # INovo.ts (se necessário)
├── routes/        # novoRoutes.ts
├── validators/    # novoValidator.ts
└── tests/
    ├── services/  # NovoService.test.ts
    ├── controllers/# NovoController.test.ts
    └── integration/# novoRoutes.test.ts
```

### Integração com OpenAI

- Centralizar chamadas em serviços dedicados
- Usar variável `OPENAI_API_KEY` em `.env`
- Tratar fallbacks quando API falhar (como já feito em `AIAnalysisService`)
- Considerar rate limits e custos (ex.: `gpt-4o-mini` para tarefas leves)

---

## 📊 Matriz de Priorização

| Funcionalidade | Impacto | Esforço | Dependências | Prioridade |
|----------------|---------|---------|--------------|------------|
| Análise inteligente (anomalias, padrões) | Alto | Médio | AIAnalysisService existente | P0 |
| Sugestões de investimento | Alto | Médio | Módulo investimentos | P0 |
| Consultor financeiro de IA | Alto | Alto | Dados do usuário | P0 |
| WhatsApp – entrada de despesas | Alto | Médio | Twilio, vinculação phone | P0 |
| Chat flutuante para dúvidas | Médio | Baixo | Pode reutilizar Consultor | P1 |
| Planejamento financeiro com IA | Alto | Alto | Metas, AIAnalysisService | P1 |
| Categorização automática | Médio | Médio | Transações, categorias | P1 |
| Notificações inteligentes | Médio | Baixo | NotificationService existente | P1 |
| Previsão de fluxo de caixa | Alto | Médio | Transações, despesas recorrentes | P2 |
| Detecção de assinaturas ocultas | Médio | Médio | Transações, IA | P2 |
| PWA / modo offline | Médio | Alto | Fila de sync | P2 |
| OCR de comprovantes | Médio | Alto | Multer, OpenAI Vision | P3 |
| Simulador de aposentadoria | Médio | Médio | Metas, investimentos | P3 |
| Integração Telegram | Baixo | Médio | Lógica do WhatsApp | P3 |
| Split de despesas / modo família | Alto | Alto | Multi-usuário, permissões | P3 |
| Benchmark anonimizado | Baixo | Alto | Privacidade, dados agregados | P4 |
| Sugestão de corte de gastos por IA (#25) | Médio | Baixo | AIAnalysisService | P2 |
| Metas dinâmicas (#26) | Alto | Médio | Metas, IA | P2 |
| Reconciliação bancária assistida (#27) | Alto | Alto | Importação, transações | P3 |
| Modo voz no WhatsApp (#28) | Médio | Médio | WhatsApp, STT | P3 |
| Painel de saúde financeira (#29) | Médio | Baixo | Dashboard, métricas | P2 |
| Feedback do usuário para IA (#30) | Baixo | Baixo | Consultor, insights | P2 |

---

## 📅 Cronograma de Desenvolvimento

### Fase 1 – Fundação IA (4–6 semanas)

| # | Item | Esforço | Prioridade |
|---|------|---------|------------|
| 1.1 | Expandir `AIAnalysisService` (anomalias, padrões, previsões) | 2 sem | Alta |
| 1.2 | `InvestmentRecommendationService` + endpoint + UI | 2 sem | Alta |
| 1.3 | `FinancialPlanningService` + tela de planejamento | 2 sem | Média |
| 1.4 | Testes e ajustes de cobertura | 1 sem | Alta |

**Entregáveis:** Insights mais ricos, sugestões de investimento, tela de planejamento financeiro.

---

### Fase 2 – Consultor e Chat (3–4 semanas)

| # | Item | Esforço | Prioridade |
|---|------|---------|------------|
| 2.1 | `FinancialConsultantService` com contexto do usuário | 1,5 sem | Alta |
| 2.2 | Endpoints de chat + histórico de sessões | 1 sem | Alta |
| 2.3 | Interface de chat (página + componentes) | 1 sem | Alta |
| 2.4 | Chat flutuante para dúvidas gerais | 0,5 sem | Média |
| 2.5 | Testes e documentação Swagger | 0,5 sem | Alta |

**Entregáveis:** Consultor financeiro de IA, chat para dúvidas gerais.

---

### Fase 3 – WhatsApp (3–4 semanas)

| # | Item | Esforço | Prioridade |
|---|------|---------|------------|
| 3.1 | Webhook Twilio + validação de assinatura | 0,5 sem | Alta |
| 3.2 | `ExpenseMessageParser` (regex + NLP/IA) | 1 sem | Alta |
| 3.3 | `WhatsAppTransactionService` + criação de transação | 1 sem | Alta |
| 3.4 | Vinculação de telefone no perfil do usuário | 0,5 sem | Alta |
| 3.5 | Respostas automáticas e tratamento de erros | 0,5 sem | Alta |
| 3.6 | Testes e cenários de mensagens reais | 0,5 sem | Alta |

**Entregáveis:** Cadastro de despesas via WhatsApp.

---

### Fase 4 – Extensões e Polimento (4–6 semanas)

| # | Item | Esforço | Prioridade |
|---|------|---------|------------|
| 4.1 | Categorização automática com IA | 1,5 sem | Média |
| 4.2 | Notificações inteligentes e proativas | 1 sem | Média |
| 4.3 | Dashboard de tendências e previsões | 1,5 sem | Média |
| 4.4 | Análise de comprovantes (OCR/IA) | 1,5 sem | Baixa |
| 4.5 | Regras e automações básicas | 1 sem | Média |
| 4.6 | Ajustes de UX e performance | 1 sem | Média |

---

### Fase 5 – Recursos Avançados (6–8 semanas)

| # | Item | Esforço | Prioridade |
|---|------|---------|------------|
| 5.1 | Previsão de fluxo de caixa com IA | 2 sem | Média |
| 5.2 | Detecção de assinaturas ocultas | 1 sem | Média |
| 5.3 | Simulador de aposentadoria | 1,5 sem | Baixa |
| 5.4 | Relatórios exportáveis com narrativa IA | 1 sem | Média |
| 5.5 | Integração Telegram (reuso do parser WhatsApp) | 1 sem | Baixa |
| 5.6 | Ajuste de metas pela inflação (IPCA) | 0,5 sem | Média |
| 5.7 | Assistente de voz (comandos básicos) | 2 sem | Baixa |

---

### ⚡ Quick Wins (1–2 semanas cada)

Funcionalidades de alto impacto e baixo esforço para ganhar momentum:

1. **Alertas proativos de gastos** – Usar `NotificationService` existente + regras simples por categoria
2. **Resumo semanal por WhatsApp** – Extensão do envio atual com métricas principais
3. **Chat flutuante básico** – Modal com prompt fixo, sem persistência (MVP)
4. **Parser regex para WhatsApp** – Versão inicial sem IA, para validar fluxo
5. **Heatmap de gastos** – Gráfico por dia da semana usando Recharts (já presente)

---

## 🔧 Requisitos Técnicos e Variáveis de Ambiente

### Novas variáveis sugeridas

```env
# OpenAI (já existente)
OPENAI_API_KEY=sk-...

# Twilio WhatsApp (extensão das existentes)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
TWILIO_WHATSAPP_WEBHOOK_URL=https://api.seudominio.com/api/whatsapp/webhook

# Configurações opcionais
AI_CHAT_MODEL=gpt-4o-mini
AI_CONSULTANT_MODEL=gpt-4o
WHATSAPP_MESSAGE_PARSER=hybrid  # regex | ai | hybrid
```

### Dependências adicionais (se necessário)

- **Backend:** `twilio` (já presente), `openai` (já presente)
- Para OCR: `tesseract.js` ou API Vision da OpenAI
- Para NLP leve: considerar uso de regex + few-shot no próprio OpenAI

---

## 📊 Métricas de Sucesso

- Cobertura de testes ≥ 80% para novos serviços
- Tempo de resposta de insights < 5s
- Taxa de acerto do parser de WhatsApp > 85% em mensagens bem formatadas
- NPS ou satisfação do usuário com consultor e chat
- Redução de tempo médio para cadastro de despesa (com WhatsApp)

---

## 🚀 Próximos Passos Imediatos

1. **Validar escopo** – Revisar matriz de priorização com stakeholders e ajustar P0/P1
2. **Quick Wins** – Iniciar por 1–2 itens de baixo esforço para validar valor rapidamente
3. **Sprint inicial** – Definir Fase 1 (Fundação IA) como epic e quebrar em stories
4. **Ambiente** – Garantir `OPENAI_API_KEY`, Twilio Sandbox e webhook configurados
5. **Issues** – Criar issues no repositório mapeando este plano (labels: `ai`, `whatsapp`, `quick-win`, etc.)
6. **TDD** – Manter disciplina de testes (≥80% cobertura) em todos os novos serviços
7. **Swagger** – Documentar novos endpoints conforme forem implementados
8. **Roadmap** – Consultar `docs/ROADMAP-EXECUTIVO.md` para uso com Kanban e acompanhamento de sprints

---

## 📋 Checklist de Conformidade com Padrões (.cursor/rules)

Ao implementar cada funcionalidade, validar:

- [ ] **general.mdc** – TDD, SOLID, Clean Code, DRY
- [ ] **backend.mdc** – MSC, Repository Pattern, TSyringe, Zod, Swagger
- [ ] **frontend.mdc** – ShadCN/ui, Tailwind, React Hook Form, Zod, hooks reutilizáveis
- [ ] Novos serviços com interface em `interfaces/services/`
- [ ] Registro no `container.ts` para injeção de dependências
- [ ] Testes em `tests/services/`, `tests/controllers/`, `tests/integration/`

---

*Documento criado em março de 2025. Última atualização: março de 2025. Atualize conforme a evolução do projeto.*

*Consulte `docs/ROADMAP-EXECUTIVO.md` para visão executiva e uso paralelo com Kanban.*
