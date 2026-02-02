// MIND-SAFE Risk Detection System
// Detecta indicadores de risco em mensagens antes de enviar ao LLM

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type RiskType =
  | 'suicidal_ideation'
  | 'self_harm'
  | 'violence'
  | 'substance_crisis'
  | 'panic_attack'
  | 'severe_distress'
  | 'other'

export interface RiskAssessment {
  level: RiskLevel
  type: RiskType | null
  indicators: string[]
  confidence: number
  requiresEmergencyResponse: boolean
}

// Indicadores de risco em português
const RISK_PATTERNS: Record<'critical' | 'high' | 'medium' | 'low', { pattern: RegExp; type: RiskType }[]> = {
  critical: [
    // Ideação suicida
    { pattern: /quero\s+(me\s+)?matar/i, type: 'suicidal_ideation' },
    { pattern: /vou\s+(me\s+)?matar/i, type: 'suicidal_ideation' },
    { pattern: /penso\s+em\s+(me\s+)?matar/i, type: 'suicidal_ideation' },
    { pattern: /não\s+quero\s+mais\s+viver/i, type: 'suicidal_ideation' },
    { pattern: /acabar\s+com\s+(tudo|minha\s+vida)/i, type: 'suicidal_ideation' },
    { pattern: /suicídio/i, type: 'suicidal_ideation' },
    { pattern: /suicidar/i, type: 'suicidal_ideation' },
    { pattern: /tirar\s+(minha\s+)?vida/i, type: 'suicidal_ideation' },
    { pattern: /dar\s+fim\s+a\s+(tudo|minha\s+vida)/i, type: 'suicidal_ideation' },
    // Automutilação ativa
    { pattern: /vou\s+me\s+cortar/i, type: 'self_harm' },
    { pattern: /quero\s+me\s+machucar/i, type: 'self_harm' },
    { pattern: /vou\s+me\s+machucar/i, type: 'self_harm' },
  ],
  high: [
    // Automutilação passiva
    { pattern: /me\s+cortei/i, type: 'self_harm' },
    { pattern: /me\s+machuquei/i, type: 'self_harm' },
    { pattern: /automutilação/i, type: 'self_harm' },
    { pattern: /cutting/i, type: 'self_harm' },
    // Violência
    { pattern: /vou\s+matar\s+alguém/i, type: 'violence' },
    { pattern: /quero\s+matar\s+alguém/i, type: 'violence' },
    { pattern: /vou\s+fazer\s+uma\s+besteira/i, type: 'severe_distress' },
    // Crise de substâncias
    { pattern: /overdose/i, type: 'substance_crisis' },
    { pattern: /tomei\s+muitos\s+(remédios|comprimidos)/i, type: 'substance_crisis' },
  ],
  medium: [
    // Desesperança
    { pattern: /não\s+vejo\s+saída/i, type: 'severe_distress' },
    { pattern: /não\s+aguento\s+mais/i, type: 'severe_distress' },
    { pattern: /cansado\s+de\s+viver/i, type: 'severe_distress' },
    { pattern: /sem\s+esperança/i, type: 'severe_distress' },
    { pattern: /não\s+tenho\s+(mais\s+)?forças/i, type: 'severe_distress' },
    // Isolamento extremo
    { pattern: /não\s+quero\s+ver\s+ninguém/i, type: 'severe_distress' },
    { pattern: /me\s+isolar\s+de\s+todos/i, type: 'severe_distress' },
    // Pânico
    { pattern: /ataque\s+de\s+pânico/i, type: 'panic_attack' },
    { pattern: /não\s+consigo\s+respirar/i, type: 'panic_attack' },
    { pattern: /coração\s+acelerado/i, type: 'panic_attack' },
  ],
  low: [
    // Angústia geral
    { pattern: /ansiedade/i, type: 'other' },
    { pattern: /depressão/i, type: 'other' },
    { pattern: /muito\s+triste/i, type: 'other' },
    { pattern: /me\s+sentindo\s+mal/i, type: 'other' },
    { pattern: /estresse/i, type: 'other' },
    { pattern: /burnout/i, type: 'other' },
    { pattern: /exausto/i, type: 'other' },
    { pattern: /não\s+dormi/i, type: 'other' },
  ],
}

export function assessRisk(message: string): RiskAssessment {
  const indicators: string[] = []
  let maxLevel: RiskLevel = 'none'
  let detectedType: RiskType | null = null
  let matchCount = 0

  const levels = ['critical', 'high', 'medium', 'low'] as const

  for (const level of levels) {
    const patterns = RISK_PATTERNS[level]
    for (const { pattern, type } of patterns) {
      if (pattern.test(message)) {
        indicators.push(pattern.source)
        matchCount++
        if (maxLevel === 'none' || levels.indexOf(level) < levels.indexOf(maxLevel as typeof levels[number])) {
          maxLevel = level
          detectedType = type
        }
      }
    }
  }

  // Calcular confiança baseada no número de matches
  const confidence = Math.min(matchCount * 0.25, 1.0)

  return {
    level: maxLevel,
    type: detectedType,
    indicators,
    confidence,
    requiresEmergencyResponse: maxLevel === 'critical' || maxLevel === 'high',
  }
}

export function getEmergencyResponse(): string {
  return `Ei, percebi que você está passando por um momento muito difícil. Antes de mais nada, quero que você saiba que não está sozinho(a).

**🆘 Se você está em crise agora:**

📞 **CVV - Centro de Valorização da Vida: 188** (24h, gratuito)
Ou acesse: www.cvv.org.br

**Enquanto isso, tente:**
1. 🧊 Lave o rosto com água fria
2. 🫁 Respire fundo: inspire 4s, segure 4s, expire 4s
3. 📱 Afaste-se do celular por 5 minutos
4. 🚶 Levante-se e caminhe um pouco

Você não precisa enfrentar isso sozinho(a). Estou aqui para ouvir, mas um profissional pode te ajudar de forma mais completa.`
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}
