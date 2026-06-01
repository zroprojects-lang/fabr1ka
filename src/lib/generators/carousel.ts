import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildCarouselPrompt, UserProfile } from '@/lib/prompt-builder'

export interface CarouselSlide {
  number: number
  title: string
  body: string
  visual_note: string
}

export interface CarouselOutput {
  format: 'carousel'
  slides: CarouselSlide[]
  style?: string
  palette?: string[]
}

export async function generateCarousel(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<CarouselOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildCarouselPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseCarouselJSON(raw)

  return {
    format: 'carousel',
    ...parsed
  }
}

function parseCarouselJSON(raw: string): Omit<CarouselOutput, 'format'> {
  try {
    // Encontra JSON no texto
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    // Valida estrutura mínima
    if (!Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('Invalid slides array')
    }

    return {
      slides: data.slides as CarouselSlide[],
      style: data.style || 'modern',
      palette: data.palette || []
    }
  } catch (err) {
    // Fallback: retorna estrutura genérica
    return {
      slides: [
        {
          number: 1,
          title: 'Slide 1',
          body: 'Conteúdo do slide',
          visual_note: 'Visual sugerido'
        }
      ]
    }
  }
}
