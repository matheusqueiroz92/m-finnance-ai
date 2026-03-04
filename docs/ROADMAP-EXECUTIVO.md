# Roadmap Executivo – M. Finnance AI

> Use este documento em paralelo ao Kanban. Cada item possui **ID**, **labels** e **prioridade** para mapeamento em boards (Trello, Jira, GitHub Projects, etc.).

---

## Como usar com Kanban

| Coluna sugerida | Descrição |
|-----------------|-----------|
| **Backlog** | Itens priorizados aguardando sprint |
| **Próximo** | Selecionados para a próxima iteração |
| **Em andamento** | Em desenvolvimento ativo |
| **Revisão** | Code review / QA |
| **Concluído** | Entregue e verificado |

**Labels sugeridos:** `ai` | `whatsapp` | `quick-win` | `backend` | `frontend` | `p0` | `p1` | `p2` | `p3` | `p4`

---

## Sprint 0 – Quick Wins (1–2 semanas)

| ID | Item | Esforço | Labels | Critério de aceite |
|----|------|---------|--------|--------------------|
| QW-01 | Alertas proativos de gastos por categoria | 1 sem | `quick-win` `backend` `p1` | Alertas quando gasto em categoria > média ou limite |
| QW-02 | Resumo semanal por WhatsApp | 1 sem | `quick-win` `whatsapp` `backend` `p1` | Envio semanal com principais métricas |
| QW-03 | Chat flutuante básico (MVP sem persistência) | 1 sem | `quick-win` `ai` `frontend` `p1` | Modal/float com chat genérico funcionando |
| QW-04 | Parser regex para WhatsApp | 1 sem | `quick-win` `whatsapp` `backend` `p0` | Extrair valor + descrição de mensagens simples |
| QW-05 | Heatmap de gastos por dia da semana | 0,5 sem | `quick-win` `frontend` `p2` | Gráfico Recharts no dashboard |

---

## Fase 1 – Fundação IA (4–6 semanas)

| ID | Item | Esforço | Prioridade | Labels | Depende de |
|----|------|---------|------------|--------|------------|
| F1-01 | Expandir AIAnalysisService: anomalias | 0,5 sem | P0 | `ai` `backend` `p0` | — |
| F1-02 | Expandir AIAnalysisService: padrões de consumo | 0,5 sem | P0 | `ai` `backend` `p0` | F1-01 |
| F1-03 | Expandir AIAnalysisService: previsão de gastos | 1 sem | P0 | `ai` `backend` `p0` | F1-01, F1-02 |
| F1-04 | InvestmentRecommendationService + interface | 1 sem | P0 | `ai` `backend` `p0` | Módulo investimentos |
| F1-05 | Endpoint + UI de sugestões de investimento | 1 sem | P0 | `backend` `frontend` `p0` | F1-04 |
| F1-06 | FinancialPlanningService + interface | 1,5 sem | P1 | `ai` `backend` `p1` | Metas, AIAnalysisService |
| F1-07 | Tela de planejamento financeiro | 1,5 sem | P1 | `frontend` `p1` | F1-06 |
| F1-08 | Testes e cobertura ≥80% (Fase 1) | 1 sem | P0 | `backend` `frontend` | Todos F1 |

---

## Fase 2 – Consultor e Chat (3–4 semanas)

| ID | Item | Esforço | Prioridade | Labels | Depende de |
|----|------|---------|------------|--------|------------|
| F2-01 | FinancialConsultantService com contexto do usuário | 1,5 sem | P0 | `ai` `backend` `p0` | — |
| F2-02 | Endpoints de chat + histórico de sessões | 1 sem | P0 | `backend` `p0` | F2-01 |
| F2-03 | Página do consultor + componentes (ConsultantChat, etc.) | 1 sem | P0 | `frontend` `p0` | F2-02 |
| F2-04 | Chat flutuante com toggle "Usar meus dados" | 0,5 sem | P1 | `frontend` `ai` `p1` | F2-02 |
| F2-05 | Testes e documentação Swagger | 0,5 sem | P0 | `backend` | F2-01 a F2-04 |

---

## Fase 3 – WhatsApp (3–4 semanas)

| ID | Item | Esforço | Prioridade | Labels | Depende de |
|----|------|---------|------------|--------|------------|
| F3-01 | Webhook Twilio + validação X-Twilio-Signature | 0,5 sem | P0 | `whatsapp` `backend` `p0` | — |
| F3-02 | ExpenseMessageParser (regex + IA híbrido) | 1 sem | P0 | `whatsapp` `ai` `backend` `p0` | QW-04 |
| F3-03 | WhatsAppTransactionService + criação de transação | 1 sem | P0 | `whatsapp` `backend` `p0` | F3-01, F3-02 |
| F3-04 | Vinculação de telefone no perfil do usuário | 0,5 sem | P0 | `backend` `frontend` `p0` | — |
| F3-05 | Respostas automáticas e tratamento de erros | 0,5 sem | P0 | `whatsapp` `backend` `p0` | F3-03 |
| F3-06 | Testes com cenários de mensagens reais | 0,5 sem | P0 | `backend` | F3-03 |

---

## Fase 4 – Extensões (4–6 semanas)

| ID | Item | Esforço | Prioridade | Labels | Depende de |
|----|------|---------|------------|--------|------------|
| F4-01 | Categorização automática com IA | 1,5 sem | P1 | `ai` `backend` `p1` | Transações, categorias |
| F4-02 | Notificações inteligentes e proativas | 1 sem | P1 | `backend` `p1` | NotificationService |
| F4-03 | Dashboard de tendências e previsões | 1,5 sem | P2 | `frontend` `ai` `p2` | AIAnalysisService |
| F4-04 | Regras e automações básicas | 1 sem | P2 | `backend` `p2` | Categorias |
| F4-05 | Análise de comprovantes (OCR/IA) | 1,5 sem | P3 | `ai` `backend` `p3` | Multer, Vision |
| F4-06 | Ajustes de UX e performance | 1 sem | P2 | `frontend` `p2` | — |

---

## Fase 5 – Recursos Avançados (6–8 semanas)

| ID | Item | Esforço | Prioridade | Labels | Depende de |
|----|------|---------|------------|--------|------------|
| F5-01 | Previsão de fluxo de caixa com IA | 2 sem | P2 | `ai` `backend` `frontend` `p2` | Transações, recorrentes |
| F5-02 | Detecção de assinaturas ocultas | 1 sem | P2 | `ai` `backend` `p2` | Transações |
| F5-03 | Simulador de aposentadoria | 1,5 sem | P3 | `ai` `frontend` `p3` | Metas, investimentos |
| F5-04 | Relatórios exportáveis com narrativa IA | 1 sem | P2 | `ai` `backend` `p2` | AIAnalysisService |
| F5-05 | Integração Telegram (reuso parser) | 1 sem | P3 | `backend` `p3` | F3-02 |
| F5-06 | Ajuste de metas pela inflação (IPCA) | 0,5 sem | P2 | `backend` `p2` | Metas |
| F5-07 | Assistente de voz (comandos básicos) | 2 sem | P3 | `ai` `frontend` `p3` | PWA |

---

## Melhorias Complementares (Backlog)

| ID | Item | Esforço | Prioridade | Labels |
|----|------|---------|------------|--------|
| EXT-01 | Sugestão de corte de gastos por IA | 0,5 sem | P2 | `ai` `backend` |
| EXT-02 | Metas dinâmicas | 1 sem | P2 | `ai` `backend` |
| EXT-03 | Reconciliação bancária assistida | 2 sem | P3 | `ai` `backend` |
| EXT-04 | Modo voz no WhatsApp | 1 sem | P3 | `whatsapp` `ai` |
| EXT-05 | Painel de saúde financeira | 0,5 sem | P2 | `frontend` |
| EXT-06 | Feedback do usuário para IA (Útil/Não útil) | 0,5 sem | P2 | `backend` `frontend` |
| EXT-07 | PWA / modo offline | 2 sem | P2 | `frontend` |
| EXT-08 | Split de despesas / modo família | 3 sem | P3 | `backend` `frontend` |
| EXT-09 | Benchmark anonimizado | 2 sem | P4 | `ai` `backend` |
| EXT-10 | Gamificação e motivação | 1,5 sem | P3 | `frontend` `backend` |

---

## Métricas de Entrega

| Métrica | Meta |
|---------|------|
| Cobertura de testes | ≥ 80% em novos serviços |
| Tempo de resposta (insights) | < 5s |
| Taxa de acerto do parser WhatsApp | > 85% em mensagens bem formatadas |
| Documentação Swagger | Novos endpoints documentados |

---

## Referência Rápida – Ordem Sugerida

1. **Sprint 0:** QW-04 → QW-03 → QW-01
2. **Fase 1:** F1-01 → F1-02 → F1-03 → F1-04 → F1-05
3. **Fase 2:** F2-01 → F2-02 → F2-03 → F2-04
4. **Fase 3:** F3-01 → F3-02 → F3-03 → F3-04 → F3-05
5. **Fase 4:** F4-01 → F4-02 → F4-03
6. **Fase 5:** conforme prioridade e capacidade

---

*Roadmap criado em março de 2025. Sincronize com `docs/PLANO-MELHORIAS-IA.md` para detalhes técnicos.*
