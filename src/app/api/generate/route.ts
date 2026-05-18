import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Check credits
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, credits_remaining, credits_reset_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  // Reset daily credits if expired
  const now = new Date()
  if (new Date(profile.credits_reset_at) <= now && profile.plan === 'free') {
    await admin
      .from('profiles')
      .update({
        credits_remaining: 10,
        credits_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', user.id)
    profile.credits_remaining = 10
  }

  // Check if user has credits (pro = unlimited)
  if (profile.plan === 'free' && profile.credits_remaining <= 0) {
    return NextResponse.json({
      error: 'Créditos esgotados! Faça upgrade para PRO ou aguarde o reset diário.',
    }, { status: 429 })
  }

  const { prompt, negative_prompt, model, width, height } = await request.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
  }

  try {
    // Generate image using HuggingFace Inference API
    const hfModel = getHFModel(model)
    const imageBuffer = await generateWithHF(hfModel, prompt, negative_prompt, width, height)

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.png`
    const { data: upload, error: uploadError } = await admin.storage
      .from('generations')
      .upload(fileName, imageBuffer, { contentType: 'image/png' })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erro ao salvar imagem' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('generations').getPublicUrl(fileName)

    // Save generation record
    await admin.from('generations').insert({
      user_id: user.id,
      prompt,
      negative_prompt: negative_prompt || null,
      model,
      image_url: publicUrl,
      width: width || 1024,
      height: height || 1024,
      status: 'completed',
    })

    // Deduct credit (free plan only)
    if (profile.plan === 'free') {
      await admin
        .from('profiles')
        .update({
          credits_remaining: profile.credits_remaining - 1,
          total_generations: (profile as any).total_generations + 1,
        })
        .eq('id', user.id)
    } else {
      await admin
        .from('profiles')
        .update({ total_generations: (profile as any).total_generations + 1 })
        .eq('id', user.id)
    }

    return NextResponse.json({ image_url: publicUrl })
  } catch (err: any) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Erro ao gerar imagem. Tente novamente.' }, { status: 500 })
  }
}

function getHFModel(model: string): string {
  switch (model) {
    case 'flux-schnell': return 'black-forest-labs/FLUX.1-schnell'
    case 'dall-e-style': return 'stabilityai/stable-diffusion-2-1'
    default: return 'stabilityai/stable-diffusion-2-1'
  }
}

async function generateWithHF(
  model: string,
  prompt: string,
  negativePrompt: string | undefined,
  width: number,
  height: number
): Promise<Buffer> {
  const payload: any = {
    inputs: prompt,
    parameters: {
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
    },
  }

  if (negativePrompt) {
    payload.parameters.negative_prompt = negativePrompt
  }

  // Try the new router-based endpoint first, fallback to legacy
  let response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // Fallback to legacy endpoint
    response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  }

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`HuggingFace API error: ${response.status} - ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
