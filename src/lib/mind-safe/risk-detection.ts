// MIND-SAFE Risk Detection System
// Detects risk indicators in messages before sending to LLM

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface RiskAssessment {
  level: RiskLevel
  indicators: string[]
  requiresEmergencyResponse: boolean
}

// Risk indicators in Portuguese (Brazil)
const RISK_PATTERNS: Record<Exclude<RiskLevel, 'none'>, RegExp[]> = {
  critical: [
    // Suicidal ideation
    /quero\s+(me\s+)?matar/i,
    /vou\s+(me\s+)?matar/i,
    /penso\s+em\s+(me\s+)?matar/i,
    /não\s+quero\s+mais\s+viver/i,
    /acabar\s+com\s+(tudo|minha\s+vida)/i,
    /suicídio/i,
    /suicidar/i,
    /tirar\s+(minha\s+)?vida/i,
    /dar\s+fim\s+a\s+(tudo|minha\s+vida)/i,
    // Active self-harm
    /vou\s+me\s+cortar/i,
    /quero\s+me\s+machucar/i,
    /vou\s+me\s+machucar/i,
  ],
  high: [
    // Passive self-harm
    /me\s+cortei/i,
    /me\s+machuquei/i,
    /automutilação/i,
    /cutting/i,
    // Violence
    /vou\s+matar\s+alguém/i,
    /quero\s+matar\s+alguém/i,
    /vou\s+fazer\s+uma\s+besteira/i,
    // Substance crisis
    /overdose/i,
    /tomei\s+muitos\s+(remédios|comprimidos)/i,
  ],
  medium: [
    // Hopelessness
    /não\s+vejo\s+saída/i,
    /não\s+aguento\s+mais/i,
    /cansado\s+de\s+viver/i,
    /sem\s+esperança/i,
    /não\s+tenho\s+(mais\s+)?forças/i,
    // Extreme isolation
    /não\s+quero\s+ver\s+ninguém/i,
    /me\s+isolar\s+de\s+todos/i,
    // Panic
    /ataque\s+de\s+pânico/i,
    /não\s+consigo\s+respirar/i,
    /coração\s+acelerado/i,
  ],
  low: [
    // General distress
    /ansiedade/i,
    /depressão/i,
    /muito\s+triste/i,
    /me\s+sentindo\s+mal/i,
    /estresse/i,
    /burnout/i,
    /exausto/i,
    /não\s+dormi/i,
  ],
}

const RISK_LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low', 'none']

/**
 * Assesses the risk level of a message based on predefined patterns.
 * Returns the highest risk level found and all matching indicators.
 */
export function assessRisk(message: string): RiskAssessment {
  const indicators: string[] = []
  let maxLevel: RiskLevel = 'none'

  for (const level of RISK_LEVEL_ORDER) {
    if (level === 'none') continue

    const patterns = RISK_PATTERNS[level]
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        indicators.push(pattern.source)
        // Update max level if this level is higher (earlier in the order array)
        if (
          maxLevel === 'none' ||
          RISK_LEVEL_ORDER.indexOf(level) < RISK_LEVEL_ORDER.indexOf(maxLevel)
        ) {
          maxLevel = level
        }
      }
    }
  }

  return {
    level: maxLevel,
    indicators,
    requiresEmergencyResponse: maxLevel === 'critical' || maxLevel === 'high',
  }
}

/**
 * Compares two risk levels and returns the higher one.
 */
export function getHigherRiskLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  const indexA = RISK_LEVEL_ORDER.indexOf(a)
  const indexB = RISK_LEVEL_ORDER.indexOf(b)
  return indexA <= indexB ? a : b
}

/**
 * Checks if a risk level requires immediate intervention.
 */
export function requiresIntervention(level: RiskLevel): boolean {
  return level === 'critical' || level === 'high'
}

/**
 * Returns an emergency response message for high-risk situations.
 * Includes crisis hotline information and grounding techniques.
 */
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

/**
 * Returns localized emergency resources based on country code.
 */
export function getEmergencyResources(countryCode: string = 'BR'): {
  hotline: string
  hotlineName: string
  website?: string
} {
  const resources: Record<string, { hotline: string; hotlineName: string; website?: string }> = {
    BR: {
      hotline: '188',
      hotlineName: 'CVV - Centro de Valorização da Vida',
      website: 'www.cvv.org.br',
    },
    PT: {
      hotline: '808 200 204',
      hotlineName: 'SOS Voz Amiga',
      website: 'www.sosvozamiga.org',
    },
    US: {
      hotline: '988',
      hotlineName: 'Suicide & Crisis Lifeline',
      website: '988lifeline.org',
    },
  }

  return resources[countryCode] || resources['BR']
}
