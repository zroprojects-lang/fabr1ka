// Constrói systemPrompt baseado no perfil do usuário
// Reutiliza padrão do OráculoAI mas adapta para Fabr1ka (sem astral)

export interface UserProfile {
  brand_name: string
  brand_description: string
  specialties: string[]
  specialties_other?: string
  target_audience: string
  visual_style: string
  voice_tone: string
  brand_colors: string[]
  content_goals: string[]
  instagram_handle: string
  business_type?: string
  products_services?: string[]
  content_pillars?: string[]
  posting_frequency?: string
}

export function buildSystemPrompt(profile: UserProfile): string {
  const specialties = profile.specialties.join(', ')
  const goals = profile.content_goals.join(', ')
  const colors = profile.brand_colors.join(', ')
  const businessType = profile.business_type || 'criador de conteúdo'
  const products = profile.products_services?.join(', ') || 'não especificado'
  const pillars = profile.content_pillars?.join(', ') || 'não especificado'

  return `Você é um especialista em criação de conteúdo para redes sociais.

MARCA:
- Nome: ${profile.brand_name}
- Tipo de negócio: ${businessType}
- Descrição: ${profile.brand_description}
- Produtos/Serviços: ${products}
- Instagram: @${profile.instagram_handle}

PÚBLICO-ALVO:
${profile.target_audience}

ESPECIALIDADES/NICHOS:
${specialties}${profile.specialties_other ? `\n- Outros: ${profile.specialties_other}` : ''}

IDENTIDADE VISUAL E VERBAL:
- Estilo visual: ${profile.visual_style}
- Tom de voz: ${profile.voice_tone}
- Paleta de cores: ${colors}
- Pilares de conteúdo: ${pillars}

OBJETIVOS:
${goals}

INSTRUÇÕES:
- Crie conteúdo autêntico e alinhado com a marca
- Use o tom e estilo definidos
- Adapte a linguagem para o público-alvo específico
- Seja conciso, impactante e pronto para compartilhar
- Inclua CTAs naturais quando apropriado
- Mantenha consistência com os pilares de conteúdo`
}

export function buildCarouselPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Criar um CARROSSEL de 7 slides

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Estrutura de cada slide:
- Slide 1-2: Hook impactante + contexto
- Slide 3-5: Conteúdo principal (3 pontos-chave)
- Slide 6: Aprofundamento ou reflexão
- Slide 7: CTA (call-to-action)

IMPORTANTE: Retorne em JSON válido com a estrutura abaixo:
{
  "slides": [
    {
      "number": 1,
      "title": "Título/Hook do slide",
      "body": "Texto do slide (1-2 linhas)",
      "visual_note": "Descrição visual sugerida (cores, elementos)"
    }
  ]
}

Gere agora:`
}

export function buildReelPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Criar um SCRIPT de REEL/SHORT (15-30 segundos)

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Estrutura:
- 0-3s: Hook explosivo (ganhe atenção AGORA)
- 3-10s: Apresentar o problema ou insight
- 10-20s: Solução/punchline/aprendizado
- 20-30s: CTA + retenção

IMPORTANTE: Retorne em JSON válido:
{
  "hook": "Texto dos primeiros 3 segundos (máximo impacto)",
  "script": "Roteiro completo do reel (sem marcas de tempo)",
  "scenes": [
    {
      "timing": "0-3s",
      "action": "Descrição do que aparece na tela",
      "text_overlay": "Texto que sobrepõe o vídeo"
    }
  ],
  "music_vibe": "Tipo de música sugerida (energetic, calm, trending, etc)",
  "duration": "15s ou 30s ou 60s"
}

Gere agora:`
}

export function buildCaptionPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Criar uma LEGENDA otimizada para Instagram

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Estrutura:
- Linha 1: Hook que ganha clique
- Linhas 2-4: Corpo principal (enredo, valor, história)
- Linha 5: CTA clara
- Depois: Hashtags

IMPORTANTE: Retorne em JSON válido:
{
  "hook": "Primeira linha impactante",
  "body": "Corpo da legenda (pode ter quebras de linha com \\n)",
  "cta": "Call-to-action",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "emoji_suggestions": "Recomendações de emojis a usar"
}

Gere agora:`
}

export function buildHashtagsPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Gerar HASHTAGS segmentadas

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Retorne em JSON com 3 níveis de hashtags:
- high_volume: Tags populares (1-5M posts) - maior alcance
- medium_volume: Tags médias (100k-1M posts) - engajamento
- niche: Tags de nicho (<100k posts) - comunidade específica

IMPORTANTE: Retorne em JSON válido:
{
  "high_volume": ["#tag1", "#tag2", "#tag3"],
  "medium_volume": ["#tag4", "#tag5", "#tag6"],
  "niche": ["#tag7", "#tag8", "#tag9"],
  "strategy_note": "Dica de como usar as hashtags"
}

Gere agora:`
}

export function buildVisualPromptPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Gerar PROMPTS visuais para diferentes ferramentas

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Retorne prompts otimizados para cada plataforma:

IMPORTANTE: Retorne em JSON válido:
{
  "midjourney": "Prompt em inglês para Midjourney (detalhado, artístico)",
  "dalle": "Prompt em inglês para DALL-E 3 (claro, descritivo)",
  "canva": "Sugestões de elementos/estilo para Canva (português OK)",
  "visual_notes": "Notas sobre cores, composição, etc"
}

Gere agora:`
}

export function buildNarrationPrompt(
  theme: string,
  systemPrompt: string,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Gerar SCRIPT para narração (TTS/voiceover)

TEMA: ${theme}
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

O script deve ser:
- Claro e natural (como se falasse)
- Sem pontuação complexa
- Com indicações de pausas [pausa 2s]
- Adequado para IA ler em voz alta

IMPORTANTE: Retorne em JSON válido:
{
  "script": "Texto limpo para TTS (com [pausa Xs] nos lugares apropriados)",
  "timing_marks": ["0s: intro", "5s: ponto 1", "10s: conclusão"],
  "voice_notes": "Dicas de tom (calmo, empolgado, reflexivo, etc)",
  "suggested_duration": "20-30s típico"
}

Gere agora:`
}

export function buildCalendarPrompt(
  theme: string,
  systemPrompt: string,
  days: number = 7,
  context?: Record<string, any>
): string {
  return `${systemPrompt}

TAREFA: Gerar CALENDÁRIO EDITORIAL

TEMA CENTRAL: ${theme}
DURAÇÃO: ${days} dias
${context ? `CONTEXTO ADICIONAL: ${JSON.stringify(context, null, 2)}` : ''}

Crie uma sequência de conteúdos variados que abordem ${theme} de diferentes ângulos:
- Cada dia com formato diferente (carousel, reel, caption, etc)
- Progressão lógica (problema → solução → aplicação)
- Mix de educação + inspiração + vendas

IMPORTANTE: Retorne em JSON válido:
{
  "duration_days": ${days},
  "theme_master": "${theme}",
  "posts": [
    {
      "day": 1,
      "format": "carousel",
      "title": "Título/tema do dia",
      "objective": "Qual é o objetivo (awareness, engagement, conversion)",
      "quick_brief": "Briefing em 1 frase"
    }
  ],
  "strategy_note": "Nota sobre fluxo geral e CTA progression"
}

Gere agora:`
}
