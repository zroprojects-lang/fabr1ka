import { generateCopy } from '@/lib/bedrock'
import { buildSystemPrompt, buildCalendarPrompt, UserProfile } from '@/lib/prompt-builder'

export interface CalendarPost {
  day: number
  format: string
  title: string
  objective: string
  quick_brief: string
}

export interface CalendarOutput {
  format: 'calendar'
  duration_days: number
  theme_master: string
  posts: CalendarPost[]
  strategy_note: string
}

export async function generateCalendar(
  theme: string,
  userProfile: UserProfile,
  days: number = 7,
  context?: Record<string, any>
): Promise<CalendarOutput> {
  const systemPrompt = buildSystemPrompt(userProfile)
  const userPrompt = buildCalendarPrompt(theme, systemPrompt, days, context)

  const raw = await generateCopy(systemPrompt, userPrompt)
  const parsed = parseCalendarJSON(raw, theme, days)

  return {
    format: 'calendar',
    ...parsed
  }
}

function parseCalendarJSON(
  raw: string,
  theme: string,
  days: number
): Omit<CalendarOutput, 'format'> {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])

    return {
      duration_days: data.duration_days || days,
      theme_master: data.theme_master || theme,
      posts: Array.isArray(data.posts) ? data.posts : generateFallbackCalendar(days),
      strategy_note: data.strategy_note || ''
    }
  } catch (err) {
    return {
      duration_days: days,
      theme_master: theme,
      posts: generateFallbackCalendar(days),
      strategy_note: 'Sequência de conteúdos para engajamento progressivo'
    }
  }
}

function generateFallbackCalendar(days: number): CalendarPost[] {
  const formats = ['carousel', 'reel', 'caption', 'stories', 'carousel', 'reel', 'caption']
  const posts: CalendarPost[] = []

  for (let day = 1; day <= Math.min(days, 7); day++) {
    posts.push({
      day,
      format: formats[(day - 1) % formats.length],
      title: `Conteúdo Dia ${day}`,
      objective: day === 1 ? 'awareness' : day <= 4 ? 'engagement' : 'conversion',
      quick_brief: `Conteúdo variado para dia ${day}`
    })
  }

  return posts
}
