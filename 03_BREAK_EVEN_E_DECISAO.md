# 03 — Break-even, cenários e decisão estratégica

## 1. Premissas externas

- Apple Small Business Program: 15% de comissão para elegíveis; em assinaturas, pequenos negócios recebem 85% do preço menos impostos aplicáveis.
- Google Play: assinaturas auto-renováveis tipicamente 15% de service fee; em 2026 há mudanças de billing choice que podem reduzir taxas em contextos específicos, mas não devem ser assumidas sem validação jurídica/operacional.
- RevenueCat 2026 indica que hard paywalls podem converter mais do que freemium em muitos apps, mas com alta variação; execução e retenção importam.
- Firebase/GA4 precisa medir compras in-app e eventos recomendados/customizados para decisões de funil.

## 2. Fórmulas

- Receita líquida por assinante = preço bruto × (1 - taxa loja) - impostos/perdas.
- Assinantes para break-even = custo mensal ÷ receita líquida média por assinante.
- Downloads necessários = assinantes necessários ÷ (ativação × exposição ao paywall × conversão do paywall).

## 3. Cenários de preço e assinantes

| Cenário | Custo/mês | Preço bruto | Taxa loja | Receita antes impostos | Assinantes necessários |
|---|---:|---:|---:|---:|---:|
| Conservador | R$ 7.400 | R$ 19,90 | 15% | R$ 16,92 | 438 |
| Base | R$ 6.600 | R$ 29,90 | 15% | R$ 25,42 | 260 |
| Agressivo | R$ 5.800 | R$ 39,90 | 15% | R$ 33,92 | 171 |

Com impostos/perdas de 8%, assinantes necessários sobem aproximadamente para 476, 283 e 186.

## 4. Árvore de break-even

| Variável | Exemplo ruim | Exemplo base | Exemplo bom | Alavanca |
|---|---:|---:|---:|---|
| Downloads/mês | 1.000 | 2.000 | 4.000 | Aquisição |
| Ativação | 10% | 25% | 40% | Onboarding |
| Paywall view | 30% | 60% | 75% | Produto/monetização |
| Conversão paywall | 2% | 5% | 8% | Paywall/preço/prova |
| Novos assinantes/mês | 0,6 | 15 | 96 | Funil composto |

Conclusão: dobrar aquisição com ativação baixa não resolve; melhorar ativação e paywall multiplica todo tráfego existente.

## 5. Comparação dos caminhos

| Caminho | 30 dias | 90 dias | Custo | Esforço | Risco | Probabilidade | Decisão |
|---|---|---|---|---|---|---|---|
| 1 Aquisição imediata | Médio se houver demanda | Baixo/médio se funil vaza | Médio | Alto founder | Alto | Média/baixa | Não central. |
| 2 Ativação + monetização | Alto aprendizado | Alto impacto | Baixo/médio | Médio dev | Médio | Alta | Estratégia central. |
| 3 Ticket/WebApp | Baixo | Médio | Alto | Alto dev | Alto | Baixa agora | Adiar. |
| 4 Founder-led growth | Médio | Alto se rastreado | Baixo | Médio founder | Médio | Alta como suporte | Estratégia de suporte. |
| 5 B2B2C/parcerias | Baixo | Médio | Baixo/médio | Alto founder | Médio | Média | Experimental. |
| 6 Redução custos | Alto imediato | Limitado | Baixo | Médio | Médio | Média | Fazer se houver gordura. |

## 6. Decisão

### O caminho mais provável até o break-even é

**Corrigir ativação e monetização primeiro, sustentado por founder-led growth enxuto e ASO básico rastreado.**

### A lógica

Se o app já tem adoção orgânica, o gargalo mais barato de atacar é transformar tráfego existente em usuários ativados e assinantes. Aquisição ampla sem funil mensurado aumenta custo e ruído. WebApp/premium pode elevar ticket, mas consome engenharia antes de provar o mobile.

### Maior alavanca de curto prazo

**Fazer o usuário criar um plantão com valor e ver uma síntese financeira em menos de 3 minutos.**

### Principal risco

O produto real pode ter problemas técnicos de Android, login, performance ou billing não visíveis neste repositório.

### O que deve parar agora

Calendário editorial pesado, WebApp amplo, mídia paga sem tracking e refinamentos visuais que não removem fricção de receita.
