# 00 — Resumo executivo da auditoria estratégica do Plantão360

> Status: auditoria produzida em ambiente autônomo com base nos arquivos realmente disponíveis no repositório. A pasta/ZIP citada no pedido não está presente; portanto, muitas conclusões ficam classificadas como **Informação ausente** ou **Hipótese a validar**.

## Diagnóstico em duas páginas

### Conclusão executiva

**Com as evidências atuais, eu faria a correção de ativação + monetização antes de crescer aquisição, porque o repositório disponível não comprova que o funil de cadastro, criação do primeiro plantão, paywall, billing e analytics esteja mensurado ou confiável. Não investiria em WebApp, mídia paga ampla ou calendário editorial pesado agora. O primeiro sinal de que a estratégia está funcionando será aumento mensurável da taxa `install -> first_shift_with_value -> paywall_view -> subscription_started`.**

### Nível de confiança

- **Baixo para diagnóstico do produto real**, porque os arquivos principais solicitados (`Plantao360.html`, `src/*.jsx`, brand system, landing pages, screenshots, vídeos, exports e calendário editorial) não existem neste repositório.
- **Médio para recomendação operacional**, porque o contexto informado pelo solicitante já define produto, público, custos, time e urgência financeira.
- **Médio para premissas de monetização**, usando fontes atuais de Apple, Google Play, Firebase e RevenueCat.

### Maior gargalo provável

**P0 — Falta de evidência instrumentada do funil completo.** Sem eventos de ativação, paywall, compra, renovação, cancelamento e retenção, a equipe pode confundir downloads com usuários, usuários com ativados e ativados com assinantes.

### Caminho principal recomendado

**Corrigir ativação, billing, paywall e mensuração antes de escalar aquisição.** O produto deve provar que usuários novos conseguem: instalar, entender a promessa financeira, cadastrar plantões com valores, visualizar dinheiro previsto/pendente, ver paywall contextual e assinar sem fricção.

### Três prioridades

| Prioridade | Ação | Por quê | Dono | Horizonte |
|---|---|---|---|---|
| P0 | Auditar billing, login, paywall e eventos | Bloqueia receita e aprendizado | Desenvolvedor | 14 dias |
| P1 | Redesenhar onboarding para primeiro plantão com valor | Move o usuário ao momento de valor | Ambos | 30 dias |
| P1 | Reposicionar comunicação em controle financeiro de plantões | Dor com maior urgência e disposição de pagamento | Founder | 30 dias |

### Três coisas a interromper agora

1. **Produção de muitos ativos de marca/Instagram sem métrica de instalação e ativação.**
2. **Construção de WebApp amplo antes de corrigir mobile, billing e paywall.**
3. **Mídia paga de escala antes de medir conversão e retenção.**

### Estimativa de break-even

Usando custo mensal de R$ 5.800 a R$ 7.400 e taxa de loja de 15% como premissa de pequeno desenvolvedor/subscription, o Plantão360 precisa aproximadamente de:

| Preço mensal bruto | Receita líquida aproximada antes de impostos | Assinantes para R$ 5.800 | Assinantes para R$ 7.400 |
|---:|---:|---:|---:|
| R$ 19,90 | R$ 16,92 | 343 | 438 |
| R$ 29,90 | R$ 25,42 | 229 | 292 |
| R$ 39,90 | R$ 33,92 | 171 | 219 |

Esses números ainda precisam de impostos, inadimplência/reembolso, mix anual/mensal e churn.

### Fontes externas usadas

- Apple Small Business Program: comissão reduzida de 15% para elegíveis — https://developer.apple.com/app-store/small-business-program/
- Apple auto-renewable subscriptions: pequenos negócios recebem 85% do preço menos impostos aplicáveis — https://developer.apple.com/app-store/subscriptions/
- Google Play service fees: assinaturas auto-renováveis com taxa de serviço de 15% — https://support.google.com/googleplay/android-developer/answer/112622?hl=en
- Google Play billing update 2026: taxas podem começar em 10% nos EUA em contexto específico de billing choice — https://android-developers.googleblog.com/2026/06/play-expanded-billing.html
- Firebase IAP analytics: compras in-app podem ser rastreadas automaticamente/manual conforme SDK e StoreKit — https://firebase.google.com/docs/analytics/ios/measure-in-app-purchases
- GA4 recommended events: eventos recomendados e customizados devem ser configurados para comportamentos de negócio — https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- RevenueCat State of Subscription Apps 2026: paywalls duros têm maior piso de conversão, mas execução importa — https://www.revenuecat.com/state-of-subscription-apps/
