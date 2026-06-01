import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildVisualPromptPrompt, UserProfile } from '@/lib/prompt-builder'

export interface VisualPromptOutput {
  format: 'visual_prompt'
  midjourney: string
  dalle: string
  canva: string
  visual_notes: string
}

export async function generateVisualPrompt(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<VisualPromptOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildVisualPromptPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseVisualPromptJSON(raw)

  return {
    format: 'visual_prompt',
    ...parsed
  }
}

function parseVisualPromptJSON(raw: string): Omit<VisualPromptOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    return {
      midjourney: data.midjourney || '',
      dalle: data.dalle || '',
      canva: data.canva || '',
      visual_notes: data.visual_notes || ''
    }
  } catch (err) {
    return {
      midjourney: 'A stunning visual representation of the theme',
      dalle: 'A professional design representing the concept',
      canva: 'Modern, clean design with bold typography and your brand colors',
      visual_notes: 'Use brand colors and consistent style'
    }
  }
}
