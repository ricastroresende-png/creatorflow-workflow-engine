# 04 — Roadmap de execução orientado ao break-even

## Horizonte 1 — 0 a 14 dias: estancar perdas e recuperar confiabilidade

| Prioridade | Problema | Ação | Responsável | Esforço | Métrica | Critério de conclusão |
|---|---|---|---|---|---|---|
| P0 | Receita pode estar bloqueada | Testar login, restore, compra, renovação, cancelamento, Android/iOS | Desenvolvedor | Médio | `purchase_success_rate` | Compra teste completa nas duas lojas. |
| P0 | Sem funil confiável | Implementar eventos mínimos | Desenvolvedor | Médio | Cobertura de eventos | Eventos aparecem no dashboard. |
| P1 | Ativação fraca | Reduzir criação do primeiro plantão para campos mínimos | Ambos | Médio | `first_shift_with_value_rate` | 70% dos testadores completam em <3 min. |
| P1 | Mensagem genérica | Trocar copy principal para controle de recebimentos | Founder | Baixo | CTR/installs | Landing/loja/social alinhados. |

## Horizonte 2 — 15 a 30 dias: melhorar ativação e conversão

- Lançar onboarding por tarefa.
- Exibir resumo financeiro imediatamente após primeiro plantão.
- Paywall contextual em terceiro plantão/alerta/fechamento.
- Oferta anual fundador limitada, sem desconto que destrua percepção.

## Horizonte 3 — 31 a 60 dias: escalar aquisição comprovada

- Founder-led content com CTAs rastreáveis.
- ASO: título/subtítulo/screenshots focados em plantões + recebimentos.
- Comunidades fechadas com códigos/links por origem.
- Teste mínimo de mídia somente se `install -> activated -> paid` estiver medido.

## Horizonte 4 — 61 a 90 dias: consolidar receita e retenção

- Fechamento mensal como ritual de retenção.
- Alertas de pagamentos pendentes/atrasados.
- Exportação simples de relatório financeiro.
- Programa de indicação com benefício premium controlado.

## Plano dos primeiros 14 dias

| Dia/bloco | Founder | Desenvolvedor | Ambos |
|---|---|---|---|
| 1 | Confirmar custos, preços atuais, lojas e dados | Mapear eventos existentes | Definir baseline. |
| 2 | Recrutar 5 usuários para teste | Testar billing em sandbox/prod controlado | Priorizar bugs P0. |
| 3 | Reescrever proposta em tese financeira | Instrumentar `first_open`, `signup`, `shift_created` | Revisar nomenclatura. |
| 4 | Gravar 1 demo real do fluxo | Instrumentar paywall/compras | Validar evento no dashboard. |
| 5 | Entrevistar 2 usuários ativos | Simplificar formulário de plantão | Decidir campos mínimos. |
| 6–7 | Revisar loja/landing | Corrigir Android/login críticos | Publicar hotfix se necessário. |
| 8 | Entrevistar abandonos/cancelados | Implementar resumo financeiro pós-plantão | Teste interno. |
| 9 | Criar 3 conteúdos founder-led | Paywall contextual | Definir preço/teste. |
| 10 | Configurar links rastreáveis | QA compra/restore | Checklist release. |
| 11 | Postar conteúdo 1 | Release onboarding/paywall | Monitorar eventos. |
| 12 | Comunidades com convite rastreável | Corrigir falhas | Review métricas. |
| 13 | Postar conteúdo 2 | Ajustes | Decidir manter/mudar. |
| 14 | Síntese das entrevistas | Dashboard semanal | Próximo sprint. |

## Roteiro de entrevistas

Perguntas centrais:

1. Como você controla hoje plantões, valores e pagamentos?
2. Qual foi a última vez que ficou em dúvida sobre valor a receber?
3. O que você fez depois do primeiro login no Plantão360?
4. Em que momento percebeu valor ou desistiu?
5. Que alternativa você usa quando não usa o app?
6. Por qual recurso pagaria sem pensar muito?
7. O que faria você cancelar?
8. Que frase você usaria para explicar o app a outro médico?

Amostra mínima: 5 ativos, 5 abandonos, 3 assinantes/cancelados se existirem.
