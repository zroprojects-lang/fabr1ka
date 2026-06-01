import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { generateCarousel } from '@/lib/generators/carousel'
import { generateReel } from '@/lib/generators/reel'
import { generateCaption } from '@/lib/generators/caption'
import { generateHashtags } from '@/lib/generators/hashtags'
import { generateVisualPrompt } from '@/lib/generators/visual-prompt'
import { generateNarration } from '@/lib/generators/narration'
import { generateCalendar } from '@/lib/generators/calendar'
import { rateLimit } from '@/lib/rate-limit'

type Format = 'carousel' | 'reel' | 'caption' | 'hashtags' | 'visual_prompt' | 'narration' | 'calendar'

const PLAN_LIMITS: Record<string, { batches_per_hour: number; max_formats: number }> = {
  free: { batches_per_hour: 2, max_formats: 3 },
  basic: { batches_per_hour: 10, max_formats: 5 },
  pro: { batches_per_hour: 30, max_formats: 10 },
  premium: { batches_per_hour: 999, max_formats: 20 }
}

interface GenerateRequest {
  theme: string
  context?: Record<string, any>
  formats: Format[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as GenerateRequest

    if (!body.theme || !Array.isArray(body.formats) || body.formats.length === 0) {
      return NextResponse.json(
        { error: 'Tema e formatos são obrigatórios' },
        { status: 400 }
      )
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const ipLimit = rateLimit(`ip:factory:${ip}`, 20, 60_000)
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Limite de requisições por IP excedido' },
        { status: 429 }
      )
    }

    // Pega dados do usuário para rate limiting por plano
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, brand_name, target_audience, voice_tone, visual_style, brand_colors, content_goals, specialties')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não configurado. Complete o onboarding.' },
        { status: 400 }
      )
    }

    const userPlan = profile.plan || 'free'
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free

    // Rate limiting por usuário/plano
    const userLimit = rateLimit(`user:factory:${user.id}`, limits.batches_per_hour, 3600_000)
    if (!userLimit.success) {
      return NextResponse.json(
        {
          error: `Limite de ${limits.batches_per_hour} batches/hora atingido. Upgrade para continuar.`,
          remaining: userLimit.remaining
        },
        { status: 429 }
      )
    }

    // Valida quantidade de formatos
    if (body.formats.length > limits.max_formats) {
      return NextResponse.json(
        {
          error: `Seu plano (${userPlan}) permite até ${limits.max_formats} formatos. Você solicitou ${body.formats.length}.`
        },
        { status: 400 }
      )
    }

    // Cria batch no banco
    const { data: batch, error: batchError } = await adminClient
      .from('factory_batches')
      .insert({
        user_id: user.id,
        theme: body.theme,
        context: body.context || {},
        status: 'processing',
        total_formats: body.formats.length,
        completed_formats: 0
      })
      .select()
      .single()

    if (batchError || !batch) {
      console.error('Batch creation error:', batchError)
      return NextResponse.json(
        { error: 'Erro ao criar batch' },
        { status: 500 }
      )
    }

    console.log(`✅ Batch criado: ${batch.id} (${body.formats.length} formatos)`)

    // Gera todos os formatos em paralelo
    const results = await Promise.allSettled(
      body.formats.map((format) => generateFormat(format, body.theme, profile, body.context))
    )

    // Processa resultados
    const outputs = []
    let successCount = 0

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const format = body.formats[i]

      if (result.status === 'fulfilled') {
        try {
          const { error: insertError } = await adminClient.from('factory_outputs').insert({
            batch_id: batch.id,
            format,
            content: result.value,
            status: 'completed'
          })

          if (!insertError) {
            outputs.push({ format, status: 'completed' })
            successCount++
            console.log(`✅ ${format} gerado com sucesso`)
          } else {
            outputs.push({ format, status: 'failed', error: insertError.message })
            console.error(`❌ Erro ao salvar ${format}:`, insertError)
          }
        } catch (err) {
          outputs.push({ format, status: 'failed', error: String(err) })
          console.error(`❌ Erro ao salvar ${format}:`, err)
        }
      } else {
        outputs.push({ format, status: 'failed', error: result.reason.message })
        console.error(`❌ Erro ao gerar ${format}:`, result.reason)
      }
    }

    // Atualiza status do batch
    await adminClient
      .from('factory_batches')
      .update({
        status: successCount > 0 ? 'completed' : 'failed',
        completed_formats: successCount,
        completed_at: new Date().toISOString(),
        error: successCount === 0 ? 'Nenhum formato foi gerado com sucesso' : null
      })
      .eq('id', batch.id)

    return NextResponse.json({
      ok: true,
      batch_id: batch.id,
      outputs,
      success_count: successCount,
      total_formats: body.formats.length
    })
  } catch (err) {
    console.error('Factory generate error:', err)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdos' },
      { status: 500 }
    )
  }
}

async function generateFormat(
  format: Format,
  theme: string,
  profile: any,
  context?: Record<string, any>
) {
  const userProfile = {
    brand_name: profile.brand_name,
    brand_description: profile.brand_description || '',
    specialties: profile.specialties || [],
    target_audience: profile.target_audience || '',
    visual_style: profile.visual_style || 'modern',
    voice_tone: profile.voice_tone || 'profissional',
    brand_colors: profile.brand_colors || [],
    content_goals: profile.content_goals || [],
    instagram_handle: profile.instagram_handle || ''
  }

  switch (format) {
    case 'carousel':
      return await generateCarousel(theme, userProfile, context)
    case 'reel':
      return await generateReel(theme, userProfile, context)
    case 'caption':
      return await generateCaption(theme, userProfile, context)
    case 'hashtags':
      return await generateHashtags(theme, userProfile, context)
    case 'visual_prompt':
      return await generateVisualPrompt(theme, userProfile, context)
    case 'narration':
      return await generateNarration(theme, userProfile, context)
    case 'calendar':
      return await generateCalendar(theme, userProfile, 7, context)
    default:
      throw new Error(`Formato desconhecido: ${format}`)
  }
}
