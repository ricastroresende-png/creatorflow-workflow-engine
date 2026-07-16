# 02 — Auditoria completa de produto, UX/UI, marca, monetização, aquisição e operação

## 1. Posicionamento e proposta de valor

### Comparação das teses

| Tese | Dor | Urgência | Clareza | Conversão | Aderência ao produto informado | Veredito |
|---|---|---|---|---|---|---|
| A — Agenda de plantões | Média | Média | Alta | Média | Alta | Fácil de entender, mas vira commodity de calendário. |
| B — Controle de recebimentos | Alta | Alta | Alta | Alta | Alta | Melhor tese de curto prazo: dinheiro pendente e trabalhado é dor concreta. |
| C — Sistema operacional | Média | Média | Média | Média | Média | Forte para visão, fraca para conversão imediata. |
| D — Proteção financeira | Alta | Alta | Alta | Alta | Média/alta | Mais emocional, precisa prova para não soar alarmista. |
| E — Gestão profissional | Média | Média | Média | Média | Alta | Boa tese secundária para maturidade/premium. |

**Tese principal recomendada:** B, com apoio de D.

- Frase de posicionamento: **Plantão360 é o controle financeiro e operacional do médico plantonista.**
- Promessa principal: **Saiba quanto você trabalhou, quanto recebeu e quanto ainda falta receber.**
- Proposta de valor: **Cadastre plantões, acompanhe pagamentos, organize documentos e feche o mês sem depender de WhatsApp, planilhas e memória.**
- Tagline: **Seus plantões. Seu dinheiro. Tudo sob controle.**
- Elevator pitch: **O Plantão360 ajuda médicos plantonistas a transformar escalas dispersas em uma visão clara de agenda, valores a receber, pagamentos e documentos, reduzindo desorganização e risco financeiro.**
- Mensagem de loja: **Controle seus plantões, valores a receber e pagamentos em um app feito para a rotina médica.**
- Landing page: **Pare de descobrir pagamento atrasado tarde demais: registre plantões, acompanhe recebimentos e feche seu mês médico em minutos.**
- Redes sociais: **Você sabe exatamente quanto tem a receber dos últimos plantões?**

Classificação: **Hipótese a validar**, pois faltam loja, landing e copy real.

## 2. Produto e arquitetura de informação

### Arquitetura ideal mínima

1. **Hoje/Início:** resumo financeiro, próximo plantão, pendências.
2. **Plantões:** calendário/lista, criação, recorrência, hospital, valor, status.
3. **Pagamentos:** recebido, pendente, atrasado, fechamento mensal.
4. **Documentos:** somente se conectado à rotina de hospitais/plantões.
5. **Conta/Premium:** assinatura, exportação, backup, preferências.

### Riscos prováveis

| Risco | Evidência | Classificação | Intervenção |
|---|---|---|---|
| App parecer agenda genérica | Contexto enfatiza escalas e organização | Hipótese a validar | Trazer valor financeiro para home e onboarding. |
| Muitos módulos antes de ativação | Pilares incluem agenda, pagamentos, documentos, visão financeira | Hipótese a validar | Priorizar primeiro plantão com valor e primeira visão financeira. |
| Documentos virarem repositório genérico | Uso menos frequente que plantões/pagamentos | Hipótese a validar | Tornar premium futuro, não centro da ativação. |

## 3. Jornada principal

| Etapa | Intenção | Fricção provável | Evento necessário | Intervenção |
|---|---|---|---|---|
| Descoberta | Resolver bagunça financeira/escala | Mensagem genérica | `campaign_click` | Hook financeiro específico. |
| Loja | Entender confiança | Screenshots genéricos | `store_view` | Sequência de prints com dinheiro pendente e fechamento. |
| Instalação | Testar rápido | Login cedo | `first_open` | Permitir começar com dados mínimos. |
| Onboarding | Entender utilidade | Explicação demais | `onboarding_step_completed` | Onboarding por tarefa. |
| Primeiro plantão | Cadastrar escala real | Muitos campos | `shift_created` | Modelo rápido: hospital, data, valor. |
| Primeiro valor | Ver dinheiro previsto | Valor opcional/escondido | `shift_value_added` | Valor como campo central. |
| Aha | Perceber controle | Home não mostra síntese | `financial_summary_viewed` | Mostrar “Você tem R$ X previsto / R$ Y pendente”. |
| Paywall | Decidir pagar | Momento cedo ou desconectado | `paywall_view` | Contextual: histórico, recorrência, alertas, fechamento. |
| Assinatura | Comprar | Billing falha/desconfiança | `subscription_started` | Restore, termos claros, plano anual destacado. |
| Retenção | Voltar semanal/mensal | Sem gatilho útil | `monthly_close_viewed` | Resumo semanal e fechamento mensal. |

## 4. Ativação

- Evento intermediário 1: `hospital_added`.
- Evento intermediário 2: `shift_created`.
- **Evento de ativação primário:** `first_shift_with_value_created`.
- Evento qualificado: `three_shifts_with_value_created` ou `monthly_receivables_summary_viewed`.
- Momento “aha”: usuário vê receita prevista/pendente consolidada depois de cadastrar pelo menos um plantão com valor.

## 5. Funcionalidades

| Funcionalidade | Problema | Frequência | Valor percebido | Receita | Esforço | Recomendação |
|---|---|---|---|---|---|---|
| Cadastrar plantão | Lembrar escala | Alta | Alto | Indireto | Médio | P0/P1 manter simples. |
| Valor por plantão | Saber quanto trabalhou | Alta | Alto | Direto | Baixo/médio | P0 centralizar. |
| Status de pagamento | Saber pendente/recebido | Alta | Alto | Direto | Médio | P0/P1 premium ou limite. |
| Fechamento mensal | Controle financeiro | Mensal | Muito alto | Direto | Médio | P1 monetização. |
| Alertas de pagamento | Evitar atraso | Média | Alto | Direto | Médio | P1 premium. |
| Documentos | Evitar perda | Baixa/média | Médio | Indireto | Médio | P2, não ativação. |
| WebApp | Gestão avançada | Baixa/média | Médio/alto para heavy users | Futuro | Alto | P2/P3 adiar. |
| Conteúdo editorial extenso | Aquisição | Variável | Incerto | Indireto | Alto founder | Reduzir para formatos mensuráveis. |

## 6. UX/onboarding ideal

| Tela | Objetivo | Título | Ação | Evento | Critério de avanço |
|---|---|---|---|---|---|
| 1 | Segmentar minimamente | “Como você organiza seus plantões hoje?” | Escolher: WhatsApp/planilha/memória/app | `onboarding_answered` | Resposta dada ou pular. |
| 2 | Promessa financeira | “Vamos calcular quanto você tem a receber” | Começar | `onboarding_value_prop_viewed` | CTA. |
| 3 | Primeiro plantão | “Adicione seu próximo plantão” | Data, hospital, valor | `shift_draft_started` | Campos mínimos. |
| 4 | Resultado | “Você já tem R$ X previsto” | Ver resumo | `financial_summary_viewed` | Resumo exibido. |
| 5 | Conta progressiva | “Salve seu controle com segurança” | Criar conta/Apple/Google | `signup_started` | Conta criada. |
| 6 | Paywall contextual | “Controle pagamentos e alertas sem limite” | Assinar/teste | `paywall_view` | Compra, trial ou continuar limitado. |

## 7. UI/design system

Sem arquivos visuais, a recomendação é um padrão: visual claro, financeiro, profissional, com baixa ornamentação.

Prioridades de aparência premium:

1. **P0:** legibilidade de valores, datas, status de pagamento e próximos plantões.
2. **P1:** estados vazios com CTA único (“Cadastrar primeiro plantão”).
3. **P1:** tokens consistentes de status: previsto, realizado, recebido, atrasado.
4. **P2:** prova de segurança e backup.
5. **P3:** refinamentos visuais de marca.

## 8. Monetização

### Arquiteturas

| Modelo | Gratuito | Pago | Preço hipotético | Risco | Adequação |
|---|---|---|---|---|---|
| Freemium por limite | Até 5 plantões/mês, 1 hospital, sem histórico longo | Plantões ilimitados, pagamentos, alertas, fechamento | R$ 19,90–29,90/mês | Usuário leve não paga | Alta agora. |
| Trial + paywall forte | Teste 7 dias com tudo | Assinatura após trial | R$ 29,90–39,90/mês | Pode reduzir ativação se promessa fraca | Média, precisa onboarding forte. |
| Premium anual founder | Gratuito limitado + plano anual com desconto fundador | Anual R$ 199–299 | Menor MRR previsível se desconto excessivo | Alta para caixa inicial se bem comunicado. |

**Escolha:** freemium limitado + anual fundador opcional, com paywall contextual após primeiro valor/terceiro plantão.

## 9. Aquisição e marketing

### Canal principal

**Founder-led content no Instagram/TikTok com demonstração real do problema financeiro.** Ricardo tem autoridade por viver a dor, mas deve operar em formato leve: 3 vídeos curtos/semana + 2 stories de bastidor + 1 prova/CTA.

### Canal secundário

**Comunidades médicas e grupos fechados com convite rastreável.** Não spam: oferta de checklist/planilha de transição + app.

### Canal experimental

**ASO e store listing tests.** Baixo custo, mensurável e aderente a busca por “plantão médico”, “escala médica”, “controle de plantões”.

### Ignorar por 90 dias

YouTube longo, WebApp como canal, mídia paga ampla, parcerias hospitalares lentas, agência completa, calendário diário complexo.

## 10. Operação enxuta

### Ritual semanal de 45 minutos

1. Métricas: installs, first open, primeiro plantão com valor, paywall, compra, churn.
2. Bugs P0: login, billing, crash, Android.
3. Experimento ativo: um de produto e um de growth no máximo.
4. Conteúdo: 3 peças da semana com CTA rastreável.
5. Decisões: manter, pausar ou mudar.

### Regra de backlog

Só entra tarefa ligada a ativação, receita, retenção, confiabilidade, redução de custo ou aprendizado crítico.
