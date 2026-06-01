import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildReelPrompt, UserProfile } from '@/lib/prompt-builder'

export interface ReelScene {
  timing: string
  action: string
  text_overlay: string
}

export interface ReelOutput {
  format: 'reel'
  hook: string
  script: string
  scenes: ReelScene[]
  music_vibe: string
  duration: string
}

export async function generateReel(
  theme: string,
  userProfile: UserProfile,
  context?: Record<string, any>
): Promise<ReelOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildReelPrompt(theme, systemPrompt, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseReelJSON(raw)

  return {
    format: 'reel',
    ...parsed
  }
}

function parseReelJSON(raw: string): Omit<ReelOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    // Valida estrutura
    if (!data.hook || !data.script) {
      throw new Error('Missing required fields')
    }

    return {
      hook: data.hook,
      script: data.script,
      scenes: Array.isArray(data.scenes) ? data.scenes : [],
      music_vibe: data.music_vibe || 'trending',
      duration: data.duration || '15s'
    }
  } catch (err) {
    return {
      hook: 'Hook impactante aqui',
      script: 'Seu script de reel completo',
      scenes: [],
      music_vibe: 'trending',
      duration: '15s'
    }
  }
}
