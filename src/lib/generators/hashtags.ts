import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildHashtagsPrompt, UserProfile } from '@/lib/prompt-builder'

export interface HashtagsOutput {
  format: 'hashtags'
  high_volume: string[]
  medium_volume: string[]
  niche: string[]
  strategy_note: string
}

export async function generateHashtags(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<HashtagsOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildHashtagsPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseHashtagsJSON(raw)

  return {
    format: 'hashtags',
    ...parsed
  }
}

function parseHashtagsJSON(raw: string): Omit<HashtagsOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    return {
      high_volume: sanitizeHashtags(data.high_volume),
      medium_volume: sanitizeHashtags(data.medium_volume),
      niche: sanitizeHashtags(data.niche),
      strategy_note: data.strategy_note || ''
    }
  } catch (err) {
    return {
      high_volume: ['#conteudo', '#socialmedia', '#marketing'],
      medium_volume: ['#criadordeconteudo', '#comunidade', '#inspiracao'],
      niche: ['#nichotarget', '#autentico', '#viral'],
      strategy_note: 'Use 3-4 high volume, 3-4 medium, 3-4 niche'
    }
  }
}

function sanitizeHashtags(arr: any[]): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((tag) => {
      const str = String(tag).toLowerCase().trim()
      return str.startsWith('#') ? str : `#${str}`
    })
    .filter((tag) => tag.length > 1)
}
