'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const BUSINESS_TYPES = [
  { id: 'terapeuta', label: '👩‍⚕️ Terapeuta/Holístico' },
  { id: 'criador_conteudo', label: '🎬 Criador de Conteúdo' },
  { id: 'empresa', label: '🏢 Empresa/Marca' },
  { id: 'mentor_coach', label: '🎯 Mentor/Coach' },
  { id: 'especialista', label: '📚 Especialista/Consultor' },
  { id: 'outro', label: '🎨 Outro' },
]

const CONTENT_PILLARS = [
  { id: 'educacao', label: 'Educação/Tutorial' },
  { id: 'inspiracao', label: 'Inspiração' },
  { id: 'bastidores', label: 'Bastidores' },
  { id: 'vendas', label: 'Vendas/Promoção' },
  { id: 'comunidade', label: 'Comunidade/Engajamento' },
  { id: 'personal_brand', label: 'Personal Brand' },
]

const VOICE_TONES = [
  { id: 'profissional', label: 'Profissional', desc: 'Formal, autoridade, especialista' },
  { id: 'descontraido', label: 'Descontraído', desc: 'Amigável, casual, próximo' },
  { id: 'inspirador', label: 'Inspirador', desc: 'Motivacional, empoderador' },
  { id: 'educativo', label: 'Educativo', desc: 'Didático, claro, acessível' },
  { id: 'criativo', label: 'Criativo', desc: 'Inovador, original, diferente' },
]

const VISUAL_STYLES = [
  { id: 'minimalista', label: 'Minimalista', desc: 'Clean, espaço branco, elegante' },
  { id: 'colorido', label: 'Colorido', desc: 'Vibrante, energético, chamativo' },
  { id: 'moderno', label: 'Moderno', desc: 'Contemporâneo, tendências, inovador' },
  { id: 'classico', label: 'Clássico', desc: 'Intemporal, sofisticado, tradicional' },
  { id: 'playful', label: 'Playful', desc: 'Divertido, leve, descontraído' },
]

const COLOR_PALETTES = [
  { id: 'azul_branco', label: 'Azul & Branco', colors: ['#3b82f6', '#f8fafc', '#1e3a8a'] },
  { id: 'preto_ouro', label: 'Preto & Ouro', colors: ['#000000', '#fbbf24', '#f3f4f6'] },
  { id: 'rosa_roxo', label: 'Rosa & Roxo', colors: ['#ec4899', '#a855f7', '#fce7f3'] },
  { id: 'verde_bege', label: 'Verde & Bege', colors: ['#16a34a', '#d4c5a9', '#f5f5f0'] },
  { id: 'laranja_cinza', label: 'Laranja & Cinza', colors: ['#f97316', '#6b7280', '#f3f4f6'] },
  { id: 'custom', label: 'Tenho cores próprias', colors: [] },
]

const POSTING_FREQUENCY = [
  { id: 'diaria', label: 'Diária (todo dia)' },
  { id: '3x_semana', label: '3x por semana' },
  { id: 'semanal', label: 'Semanal' },
  { id: 'ocasional', label: 'Ocasional' },
]

export function OnboardingFormFabr1ka() {
  const [step, setStep] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [productsServices, setProductsServices] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentPillars, setContentPillars] = useState<string[]>([])
  const [voiceTone, setVoiceTone] = useState('descontraido')
  const [visualStyle, setVisualStyle] = useState('moderno')
  const [brandColors, setBrandColors] = useState<string[]>([])
  const [postingFrequency, setPostingFrequency] = useState('3x_semana')
  const [bestTime, setBestTime] = useState('morning')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()
  const totalSteps = 5

  const togglePillar = (id: string) => {
    setContentPillars((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const toggleColor = (id: string) => {
    setBrandColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    if (step === 0 && (!brandName || !businessType || !instagramHandle)) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    if (step === 2 && contentPillars.length === 0) {
      setError('Selecione pelo menos 1 pilar de conteúdo')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => setStep(Math.max(0, step - 1))

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Não autorizado')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          brand_name: brandName,
          business_type: businessType,
          instagram_handle: instagramHandle.replace('@', ''),
          products_services: productsServices ? [productsServices] : [],
          target_audience: targetAudience,
          content_pillars: contentPillars,
          voice_tone: voiceTone,
          visual_style: visualStyle,
          brand_colors: brandColors,
          posting_frequency: postingFrequency,
          best_posting_time: bestTime,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/factory')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-100">⚡ Bem-vindo à Fabr1ka</h1>
          <p className="text-zinc-400 mt-2">Vamos configurar seu perfil em 5 passos</p>
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition ${
                  i <= step ? 'bg-blue-500' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          {/* Step 0: Sobre você */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-zinc-100">Sobre você</h2>
              <input
                type="text"
                placeholder="Nome da marca/pessoa"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="@instagram_handle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Tipo de negócio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setBusinessType(type.id)}
                      className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                        businessType === type.id
                          ? 'border-blue-500 bg-blue-500/10 text-zinc-100'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: O que oferece */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-zinc-100">O que você oferece?</h2>
              <textarea
                placeholder="Ex: Cursos de meditação, sessões de coaching, consultoria digital..."
                value={productsServices}
                onChange={(e) => setProductsServices(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
              <textarea
                placeholder="Descreva seu público-alvo ideal..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Step 2: Pilares de conteúdo */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-zinc-100">Pilares de conteúdo</h2>
              <p className="text-sm text-zinc-400">
                Selecione os temas principais do seu conteúdo
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_PILLARS.map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => togglePillar(pillar.id)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      contentPillars.includes(pillar.id)
                        ? 'border-blue-500 bg-blue-500/10 text-zinc-100'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {pillar.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Identidade visual e verbal */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-zinc-100">Identidade visual & verbal</h2>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Tom de voz
                </label>
                <div className="space-y-2">
                  {VOICE_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setVoiceTone(tone.id)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        voiceTone === tone.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <p className="font-medium text-zinc-100">{tone.label}</p>
                      <p className="text-xs text-zinc-500">{tone.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Estilo visual
                </label>
                <div className="space-y-2">
                  {VISUAL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setVisualStyle(style.id)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        visualStyle === style.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <p className="font-medium text-zinc-100">{style.label}</p>
                      <p className="text-xs text-zinc-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Paleta de cores e frequência */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-zinc-100">Cores & frequência</h2>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Paleta de cores da marca
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => toggleColor(palette.id)}
                      className={`p-3 rounded-lg border-2 transition ${
                        brandColors.includes(palette.id)
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <p className="text-sm font-medium text-zinc-100">{palette.label}</p>
                      {palette.colors.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Frequência de postagem
                </label>
                <div className="space-y-2">
                  {POSTING_FREQUENCY.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setPostingFrequency(freq.id)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        postingFrequency === freq.id
                          ? 'border-blue-500 bg-blue-500/10 text-zinc-100'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Melhor horário para postar
                </label>
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="morning">🌅 Manhã (6-12h)</option>
                  <option value="afternoon">☀️ Tarde (12-18h)</option>
                  <option value="evening">🌆 Noite (18-23h)</option>
                  <option value="late_night">🌙 Madrugada (23-6h)</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3 justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>

            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
              >
                Próximo
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition"
              >
                {saving ? 'Salvando...' : '✨ Começar!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
