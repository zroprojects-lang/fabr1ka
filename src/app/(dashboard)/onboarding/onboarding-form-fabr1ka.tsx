'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const BUSINESS_TYPES = [
  'Terapeuta',
  'Empresária',
  'Criadora de conteúdo',
  'Coach/Mentor',
  'E-commerce',
  'Serviços',
  'Consultoria',
  'Outro'
]

const CONTENT_PILLARS = [
  'Educação',
  'Inspiração',
  'Bastidores',
  'Vendas',
  'Comunidade',
  'Entretenimento',
  'Bem-estar',
  'Casos de sucesso'
]

const VOICE_TONES = [
  'Profissional',
  'Descontraído',
  'Inspirador',
  'Direto ao ponto',
  'Amigável',
  'Autoridade'
]

const VISUAL_STYLES = [
  'Minimalista',
  'Colorido',
  'Clean',
  'Bold',
  'Elegante',
  'Moderno'
]

const POSTING_FREQUENCIES = [
  'Diariamente',
  '5x por semana',
  '3x por semana',
  '2x por semana',
  '1x por semana'
]

interface Step1Data {
  brandName: string
  businessType: string
  instagramHandle: string
}

interface Step2Data {
  productsServices: string
  targetAudience: string
}

interface Step3Data {
  contentPillars: string[]
}

interface Step4Data {
  voiceTone: string
  visualStyle: string
}

interface Step5Data {
  brandColors: string[]
  postingFrequency: string
  bestPostingTime: string
}

export function OnboardingFormFabr1ka() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [step1, setStep1] = useState<Step1Data>({
    brandName: '',
    businessType: '',
    instagramHandle: ''
  })

  const [step2, setStep2] = useState<Step2Data>({
    productsServices: '',
    targetAudience: ''
  })

  const [step3, setStep3] = useState<Step3Data>({
    contentPillars: []
  })

  const [step4, setStep4] = useState<Step4Data>({
    voiceTone: '',
    visualStyle: ''
  })

  const [step5, setStep5] = useState<Step5Data>({
    brandColors: [],
    postingFrequency: '',
    bestPostingTime: 'Manhã'
  })

  const toggleContentPillar = (pillar: string) => {
    setStep3(prev => ({
      contentPillars: prev.contentPillars.includes(pillar)
        ? prev.contentPillars.filter(p => p !== pillar)
        : [...prev.contentPillars, pillar]
    }))
  }

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...step5.brandColors]
    newColors[index] = color
    setStep5(prev => ({ ...prev, brandColors: newColors }))
  }

  const addColor = () => {
    setStep5(prev => ({
      ...prev,
      brandColors: [...prev.brandColors, '#000000']
    }))
  }

  const removeColor = (index: number) => {
    setStep5(prev => ({
      ...prev,
      brandColors: prev.brandColors.filter((_, i) => i !== index)
    }))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autorizado')

      const { error } = await supabase
        .from('profiles')
        .update({
          business_type: step1.businessType,
          products_services: step2.productsServices,
          target_audience: step2.targetAudience,
          content_pillars: step3.contentPillars,
          voice_tone: step4.voiceTone,
          visual_style: step4.visualStyle,
          brand_colors: step5.brandColors,
          posting_frequency: step5.postingFrequency,
          best_posting_time: step5.bestPostingTime,
          onboarding_completed: true
        })
        .eq('id', user.id)

      if (error) throw error

      router.push('/factory')
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err)
      alert('Erro ao salvar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-2">Etapa {step} de 5</p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Sobre você e seu negócio</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome da sua marca
              </label>
              <input
                type="text"
                placeholder="Ex: Aline Terapia Holística"
                value={step1.brandName}
                onChange={(e) => setStep1(prev => ({ ...prev, brandName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de negócio
              </label>
              <select
                value={step1.businessType}
                onChange={(e) => setStep1(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instagram (opcional)
              </label>
              <div className="flex">
                <span className="flex items-center px-4 py-3 bg-slate-900 border border-r-0 border-slate-600 rounded-l-lg text-slate-400">
                  @
                </span>
                <input
                  type="text"
                  placeholder="seu_usuario"
                  value={step1.instagramHandle}
                  onChange={(e) => setStep1(prev => ({ ...prev, instagramHandle: e.target.value }))}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-r-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">O que você oferece?</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Produtos/Serviços
              </label>
              <textarea
                placeholder="Ex: Consultorias holisticas, workshops de bem-estar, coaching pessoal..."
                value={step2.productsServices}
                onChange={(e) => setStep2(prev => ({ ...prev, productsServices: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Seu público-alvo
              </label>
              <input
                type="text"
                placeholder="Ex: Mulheres 25-45, empreendedoras, buscam bem-estar..."
                value={step2.targetAudience}
                onChange={(e) => setStep2(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Pilares de conteúdo</h2>
            <p className="text-slate-400 text-sm">Selecione os temas que mais combinem com você</p>
            
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_PILLARS.map(pillar => (
                <button
                  key={pillar}
                  onClick={() => toggleContentPillar(pillar)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    step3.contentPillars.includes(pillar)
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Sua identidade</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tom de voz
              </label>
              <select
                value={step4.voiceTone}
                onChange={(e) => setStep4(prev => ({ ...prev, voiceTone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {VOICE_TONES.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Estilo visual
              </label>
              <select
                value={step4.visualStyle}
                onChange={(e) => setStep4(prev => ({ ...prev, visualStyle: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {VISUAL_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Cores & Frequência</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Cores da marca
              </label>
              <div className="space-y-2">
                {step5.brandColors.map((color, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="w-12 h-10 bg-slate-900 border border-slate-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeColor(idx)}
                      className="px-3 py-2 bg-red-900/20 border border-red-700 rounded-lg text-red-400 hover:bg-red-900/40 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {step5.brandColors.length < 5 && (
                <button
                  onClick={addColor}
                  className="mt-3 w-full py-2 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-400 transition font-medium"
                >
                  + Adicionar cor
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Frequência de postagem
              </label>
              <select
                value={step5.postingFrequency}
                onChange={(e) => setStep5(prev => ({ ...prev, postingFrequency: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecione...</option>
                {POSTING_FREQUENCIES.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Melhor horário para postar
              </label>
              <select
                value={step5.bestPostingTime}
                onChange={(e) => setStep5(prev => ({ ...prev, bestPostingTime: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Manhã">Manhã (6-12h)</option>
                <option value="Tarde">Tarde (12-18h)</option>
                <option value="Noite">Noite (18-23h)</option>
              </select>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-500 hover:text-white transition font-medium"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
          )}
          
          <button
            onClick={() => {
              if (step === 5) {
                handleComplete()
              } else {
                setStep(step + 1)
              }
            }}
            disabled={loading}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-lg font-medium transition ${
              loading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {step === 5 ? (
              loading ? 'Salvando...' : 'Concluir'
            ) : (
              <>
                Próximo
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
