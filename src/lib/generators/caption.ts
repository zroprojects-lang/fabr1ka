import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildCaptionPrompt, UserProfile } from '@/lib/prompt-builder'

export interface CaptionOutput {
  format: 'caption'
  hook: string
  body: string
  cta: string
  hashtags: string[]
  emoji_suggestions: string
}

export async function generateCaption(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<CaptionOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildCaptionPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseCaptionJSON(raw)

  return {
    format: 'caption',
    ...parsed
  }
}

function parseCaptionJSON(raw: string): Omit<CaptionOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    return {
      hook: data.hook || '',
      body: data.body || '',
      cta: data.cta || '',
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
      emoji_suggestions: data.emoji_suggestions || ''
    }
  } catch (err) {
    return {
      hook: 'Hook da legenda',
      body: 'Corpo da legenda com valor e história',
      cta: 'Clique no link da bio',
      hashtags: ['#tag1', '#tag2', '#tag3'],
      emoji_suggestions: '💡 🚀 ✨'
    }
  }
}
