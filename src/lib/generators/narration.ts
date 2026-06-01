import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildNarrationPrompt, UserProfile } from '@/lib/prompt-builder'

export interface NarrationOutput {
  format: 'narration'
  script: string
  timing_marks: string[]
  voice_notes: string
  suggested_duration: string
}

export async function generateNarration(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<NarrationOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildNarrationPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseNarrationJSON(raw)

  return {
    format: 'narration',
    ...parsed
  }
}

function parseNarrationJSON(raw: string): Omit<NarrationOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    return {
      script: data.script || '',
      timing_marks: Array.isArray(data.timing_marks) ? data.timing_marks : [],
      voice_notes: data.voice_notes || '',
      suggested_duration: data.suggested_duration || '20-30s'
    }
  } catch (err) {
    return {
      script: 'Your narration script here, clean and ready for TTS',
      timing_marks: ['0s: intro', '10s: main point', '20s: conclusion'],
      voice_notes: 'calm and professional tone',
      suggested_duration: '20-30s'
    }
  }
}
