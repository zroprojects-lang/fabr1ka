import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { generateCopy } from '@/lib/bedrock'

const VOICE_DESCRIPTIONS: Record<string, string> = {
  acolhedora: 'Gentil, empática, calorosa. Como uma conversa com uma amiga sábia que te abraça com palavras.',
  mistica: 'Poética, simbólica, usa linguagem dos astros, elementos e arquétipos. Evoca mistério e profundidade.',
  educativa: 'Didática, clara e acessível. Explica conceitos complexos de forma simples sem perder a essência.',
  empoderada: 'Direta, motivacional, convida à ação e transformação. Linguagem forte e assertiva.',
  contemplativa: 'Reflexiva, pausada, convida à introspecção. Usa perguntas e silêncios como ferramenta.',
}

const NICHE_CONTEXT: Record<string, string> = {
  astrologia: 'astrologia, signos, trânsitos planetários, mapa astral, casas astrológicas',
  tarot: 'tarot, oráculos, arcanos, leituras intuitivas, simbolismo das cartas',
  reiki: 'reiki, energia, chakras, cura energética, imposição de mãos, equilíbrio energético',
  terapia_holistica: 'terapias holísticas, cura integral, corpo-mente-espírito, bem-estar, autocuidado',
  cristais: 'cristais, pedras, minerais, litoterapia, propriedades energéticas das pedras',
  fitoterapia: 'fitoterapia, ervas medicinais, chás, aromaterapia, plantas sagradas',
  numerologia: 'numerologia, números mestres, ciclos pessoais, vibrações numéricas, mapa numerológico',
  meditacao: 'meditação, mindfulness, presença, respiração consciente, atenção plena',
}

const TYPE_INSTRUCTIONS: Record<string, string> = {
  post_feed: 'Crie um post para feed do Instagram. Estrutura: Hook (1 frase impactante que para o scroll), Corpo (3-5 parágrafos curtos com valor), CTA (chamada para ação). Use quebras de linha para facilitar leitura.',
  stories: 'Crie uma sequência de 5-7 stories. Cada story deve ter no máximo 2 frases. O primeiro story deve ser um hook forte. O último deve ter CTA. Numere cada story.',
  carousel: 'Crie um carrossel de 7-10 slides para Instagram. Slide 1: capa com título impactante. Slides 2-9: conteúdo educativo (1-2 frases por slide). Slide final: CTA + salve/compartilhe. Numere cada slide.',
  reels_script: 'Crie um roteiro de Reels de 30-60 segundos. Estrutura: Hook (3 primeiros segundos), Desenvolvimento (conteúdo principal), CTA final. Indique ações visuais entre colchetes [ação].',
  blog_seo: 'Crie um artigo de blog otimizado para SEO. Estrutura: Título H1, Introdução (2-3 parágrafos), 3-4 H2 com conteúdo, Conclusão com CTA. Mínimo 600 palavras.',
  ad_copy: 'Crie uma copy para anúncio (Facebook/Instagram Ads). Estrutura: Headline curta, Copy principal (máx 125 caracteres visíveis), Descrição expandida, CTA button text. Crie 3 variações.',
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { success: rateLimitOk } = rateLimit(ip, 10, 60_000)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { success: userRateOk } = rateLimit(`user:${user.id}`, 15, 60_000)
  if (!userRateOk) {
    return NextResponse.json({ error: 'Limite de requisições por minuto atingido.' }, { status: 429 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('plan, credits_remaining, credits_reset_at, sub_niche, visual_style, voice_tone, brand_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  const now = new Date()
  if (new Date(profile.credits_reset_at) <= now && profile.plan === 'free') {
    await admin
      .from('profiles')
      .update({
        credits_remaining: 5,
        credits_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', user.id)
    profile.credits_remaining = 5
  }

  if (profile.plan === 'free' && profile.credits_remaining <= 0) {
    return NextResponse.json({
      error: 'Créditos esgotados! Faça upgrade para continuar criando.',
    }, { status: 429 })
  }

  const { type, topic, generateImage } = await request.json()

  if (!type || !topic) {
    return NextResponse.json({ error: 'Tipo e tópico são obrigatórios' }, { status: 400 })
  }

  if (!TYPE_INSTRUCTIONS[type]) {
    return NextResponse.json({ error: 'Tipo de conteúdo inválido' }, { status: 400 })
  }

  try {
    const voiceDesc = VOICE_DESCRIPTIONS[profile.voice_tone] || VOICE_DESCRIPTIONS.acolhedora
    const nicheCtx = NICHE_CONTEXT[profile.sub_niche] || NICHE_CONTEXT.astrologia
    const brandCtx = profile.brand_name ? `A marca/perfil se chama "${profile.brand_name}".` : ''

    const systemPrompt = `Você é um especialista em criação de conteúdo para redes sociais no nicho holístico/espiritual.
Contexto do nicho: ${nicheCtx}.
Tom de voz: ${voiceDesc}
${brandCtx}
Público-alvo: pessoas interessadas em autoconhecimento, espiritualidade e bem-estar.
Idioma: Português brasileiro.
IMPORTANTE: Não use emojis excessivos. Máximo 2-3 por post. Priorize clareza e profundidade.`

    const userPrompt = `${TYPE_INSTRUCTIONS[type]}

Tema/Tópico: ${topic}

Ao final, sugira:
- 5 hashtags relevantes (com #)
- 3 palavras-chave SEO
- Melhor horário para postar (formato: "manhã", "tarde" ou "noite" + dia da semana ideal)`

    const copyResult = await generateCopy(systemPrompt, userPrompt)

    const { hook, body, cta, hashtags, seoKeywords } = parseCopyResult(copyResult, type)

    let imageUrl: string | null = null
    let imagePrompt: string | null = null

    if (generateImage) {
      imagePrompt = buildImagePrompt(topic, profile.visual_style, profile.sub_niche)
      imageUrl = await generateContentImage(imagePrompt, user.id, profile.plan, admin)
    }

    const { data: piece } = await admin.from('content_pieces').insert({
      user_id: user.id,
      type,
      topic,
      copy_hook: hook,
      copy_body: body,
      copy_cta: cta,
      hashtags,
      seo_keywords: seoKeywords,
      image_url: imageUrl,
      image_prompt: imagePrompt,
    }).select().single()

    if (profile.plan === 'free') {
      await admin
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq('id', user.id)
    }

    return NextResponse.json({
      id: piece?.id,
      copy_hook: hook,
      copy_body: body,
      copy_cta: cta,
      hashtags,
      seo_keywords: seoKeywords,
      image_url: imageUrl,
      full_text: copyResult,
    })
  } catch (err: any) {
    console.error('Content generation error:', err?.name, err?.message)
    return NextResponse.json({ error: 'Erro ao gerar conteúdo. Tente novamente.' }, { status: 500 })
  }
}

function parseCopyResult(text: string, type: string) {
  const lines = text.split('\n')

  let hook = ''
  let body = ''
  let cta = ''
  const hashtags: string[] = []
  const seoKeywords: string[] = []

  const hashtagMatches = text.match(/#[\wÀ-ÿ]+/g)
  if (hashtagMatches) {
    hashtags.push(...hashtagMatches.slice(0, 10))
  }

  const seoLine = lines.find(l => l.toLowerCase().includes('palavras-chave') || l.toLowerCase().includes('seo'))
  if (seoLine) {
    const keywords = seoLine.replace(/.*?:/, '').split(/[,;]/).map(k => k.trim().replace(/^[-•*]\s*/, '')).filter(Boolean)
    seoKeywords.push(...keywords.slice(0, 5))
  }

  if (type === 'post_feed' || type === 'ad_copy') {
    const parts = text.split('\n\n')
    hook = parts[0] || ''
    body = parts.slice(1, -1).join('\n\n') || ''
    cta = parts[parts.length - 1] || ''
  } else {
    hook = lines[0] || ''
    body = text
    cta = lines[lines.length - 1] || ''
  }

  return { hook, body, cta, hashtags, seoKeywords }
}

function buildImagePrompt(topic: string, visualStyle: string, subNiche: string): string {
  const styleMap: Record<string, string> = {
    mystic_dark: 'dark mystical atmosphere, deep purple and gold tones, sacred geometry, stars, moon phases, cosmic energy',
    ethereal_light: 'ethereal soft light, lavender and white tones, gentle pastel colors, dreamy clouds, soft glow',
    earth_organic: 'earthy organic tones, green sage, terracotta, natural textures, plants, wood, stones',
    cosmic_vibrant: 'vibrant cosmic colors, deep blue and purple gradients, nebula, galaxy, bright energy bursts',
    minimal_sacred: 'minimalist black and white with gold accents, clean lines, sacred symbols, geometric patterns',
  }

  const nicheMap: Record<string, string> = {
    astrologia: 'zodiac symbols, celestial bodies, star charts',
    tarot: 'tarot cards, mystical symbols, intuitive imagery',
    reiki: 'healing hands, chakra colors, energy flow',
    terapia_holistica: 'holistic wellness, balanced elements, healing space',
    cristais: 'crystals, gemstones, mineral formations, light refraction',
    fitoterapia: 'herbs, botanical illustrations, natural remedies',
    numerologia: 'sacred numbers, geometric patterns, mathematical harmony',
    meditacao: 'meditation pose, peaceful landscape, zen garden',
  }

  const style = styleMap[visualStyle] || styleMap.mystic_dark
  const niche = nicheMap[subNiche] || nicheMap.astrologia

  return `Professional social media visual for holistic content. Topic: ${topic}. Style: ${style}. Elements: ${niche}. High quality, Instagram-ready, no text overlay.`
}

async function generateContentImage(prompt: string, userId: string, plan: string, admin: any): Promise<string | null> {
  try {
    const response = await fetch('https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    if (!response.ok) return null

    const arrayBuf = await response.arrayBuffer()
    let imageBuffer: any = Buffer.from(new Uint8Array(arrayBuf))

    if (plan === 'free') {
      const sharp = (await import('sharp')).default
      const image = sharp(imageBuffer)
      const metadata = await image.metadata()
      const width = metadata.width || 1024
      const height = metadata.height || 1024
      const svg = `<svg width="${width}" height="${height}">
        <text x="${width * 0.5}" y="${height * 0.95}" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="${Math.round(width * 0.04)}px" font-family="sans-serif" font-weight="bold">OráculoAI — Free</text>
      </svg>`
      imageBuffer = await image.composite([{ input: Buffer.from(svg), gravity: 'center' }]).png().toBuffer()
    }

    const fileName = `${userId}/${Date.now()}.png`
    const { error: uploadError } = await admin.storage.from('generations').upload(fileName, imageBuffer, { contentType: 'image/png' })
    if (uploadError) return null

    const { data: { publicUrl } } = admin.storage.from('generations').getPublicUrl(fileName)
    return publicUrl
  } catch {
    return null
  }
}
