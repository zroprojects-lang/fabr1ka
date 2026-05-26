'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCrossServiceContext } from '@/hooks/useCrossServiceContext'
import { Moon } from 'lucide-react'

const SPECIALTIES = [
  { id: 'astrologia', label: 'Astrologia' },
  { id: 'tarot', label: 'Tarot & Oráculos' },
  { id: 'reiki', label: 'Reiki' },
  { id: 'terapia_holistica', label: 'Terapia Holística' },
  { id: 'cristais', label: 'Cristais & Pedras' },
  { id: 'fitoterapia', label: 'Fitoterapia & Ervas' },
  { id: 'numerologia', label: 'Numerologia' },
  { id: 'meditacao', label: 'Meditação' },
  { id: 'psicologia', label: 'Psicologia / Terapia' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'ayurveda', label: 'Ayurveda' },
  { id: 'constelacao', label: 'Constelação Familiar' },
  { id: 'aromaterapia', label: 'Aromaterapia' },
  { id: 'registros_akashicos', label: 'Registros Akáshicos' },
  { id: 'coaching_espiritual', label: 'Coaching Espiritual' },
  { id: 'barras_access', label: 'Barras de Access' },
]

const CONTENT_GOALS = [
  { id: 'atrair_clientes', label: 'Atrair novos clientes' },
  { id: 'autoridade', label: 'Construir autoridade no nicho' },
  { id: 'engajamento', label: 'Aumentar engajamento' },
  { id: 'educar', label: 'Educar minha audiência' },
  { id: 'vender_cursos', label: 'Vender cursos/mentorias' },
  { id: 'comunidade', label: 'Criar comunidade' },
]

const COLOR_PALETTES = [
  { id: 'roxo_dourado', label: 'Roxo & Dourado', colors: ['#7c3aed', '#d4af37', '#1a0533'] },
  { id: 'rosa_nude', label: 'Rosa & Nude', colors: ['#ec4899', '#fecdd3', '#fef3c7'] },
  { id: 'verde_terra', label: 'Verde & Terra', colors: ['#16a34a', '#a16207', '#44403c'] },
  { id: 'azul_prata', label: 'Azul & Prata', colors: ['#3b82f6', '#94a3b8', '#1e1b4b'] },
  { id: 'preto_branco_dourado', label: 'Preto, Branco & Dourado', colors: ['#18181b', '#f4f4f5', '#d4af37'] },
  { id: 'lavanda_perola', label: 'Lavanda & Pérola', colors: ['#a78bfa', '#f3e8ff', '#fef9c3'] },
  { id: 'terracota_sage', label: 'Terracota & Sage', colors: ['#c2410c', '#84cc16', '#78716c'] },
  { id: 'custom', label: 'Tenho minhas próprias cores', colors: [] },
]

const VISUAL_STYLES = [
  { id: 'mystic_dark', label: 'Místico Escuro', desc: 'Tons profundos, sombras, energia de mistério' },
  { id: 'ethereal_light', label: 'Etéreo Claro', desc: 'Suave, luminoso, energia angelical' },
  { id: 'earth_organic', label: 'Terroso Orgânico', desc: 'Natural, acolhedor, conexão com a terra' },
  { id: 'cosmic_vibrant', label: 'Cósmico Vibrante', desc: 'Galáxias, nebulosas, energia expansiva' },
  { id: 'minimal_sacred', label: 'Minimalista Sagrado', desc: 'Clean, elegante, geometria sagrada' },
]

const VOICE_TONES = [
  { id: 'acolhedora', label: 'Acolhedora', desc: 'Gentil, empática, como uma amiga sábia' },
  { id: 'mistica', label: 'Mística', desc: 'Poética, simbólica, linguagem dos astros' },
  { id: 'educativa', label: 'Educativa', desc: 'Didática, clara, acessível' },
  { id: 'empoderada', label: 'Empoderada', desc: 'Direta, motivacional, transformadora' },
  { id: 'contemplativa', label: 'Contemplativa', desc: 'Reflexiva, pausada, introspectiva' },
]

export function OnboardingForm() {
  const [step, setStep] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtiesOther, setSpecialtiesOther] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentGoals, setContentGoals] = useState<string[]>([])
  const [brandColors, setBrandColors] = useState<string[]>([])
  const [customColors, setCustomColors] = useState('')
  const [brandDescription, setBrandDescription] = useState('')
  const [visualStyle, setVisualStyle] = useState('mystic_dark')
  const [voiceTone, setVoiceTone] = useState('acolhedora')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Hook para validar token cross-service
  const { context: crossServiceContext, loading: contextLoading } = useCrossServiceContext()

  // Quando receber contexto do Cosmos, pré-preenche
  useEffect(() => {
    if (crossServiceContext && !contextLoading) {
      // Pré-preenche com dados do Cosmos
      setBrandName(crossServiceContext.name || '')
      setSpecialties(crossServiceContext.specialties || [])
      setBrandColors(crossServiceContext.brand_colors || [])
      setVoiceTone(crossServiceContext.voice_tone || 'acolhedora')

      console.log('✅ Contexto carregado do Cosmos:', crossServiceContext)
    }
  }, [crossServiceContext, contextLoading])

  const totalSteps = 6

  function toggleSpecialty(id: string) {
    setSpecialties(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function toggleGoal(id: string) {
    setContentGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function selectColorPalette(id: string) {
    setBrandColors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleFinish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const finalColors = brandColors.includes('custom') && customColors
      ? [...brandColors.filter(c => c !== 'custom'), `custom:${customColors}`]
      : brandColors

    await supabase.from('profiles').update({
      brand_name: brandName || null,
      sub_niche: specialties[0] || 'astrologia',
      specialties,
      specialties_other: specialtiesOther || null,
      target_audience: targetAudience || null,
      content_goals: contentGoals,
      brand_colors: finalColors,
      brand_description: brandDescription || null,
      visual_style: visualStyle,
      voice_tone: voiceTone,
      instagram_handle: instagramHandle || null,
      onboarding_done: true,
      cosmos_therapist_id: crossServiceContext?.therapist_id || null, // Salva ID do Cosmos
    }).eq('id', user.id)

    router.push('/studio')
    router.refresh()
  }

  if (contextLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Moon className="animate-spin text-violet-400 mx-auto mb-3" size={32} />
        <p className="text-zinc-400">Carregando seus dados...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-10">
        <Moon size={32} className="text-violet-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {crossServiceContext ? 'Bem-vinda ao OráculoAI' : 'Bem-vinda ao OráculoAI'}
        </h1>
        <p className="text-zinc-400">Quanto mais soubermos sobre você, melhor será o conteúdo gerado</p>
        {crossServiceContext && (
          <p className="text-xs text-violet-400 mt-2">
            📡 Contexto do Cosmos carregado automaticamente
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-violet-500' : i < step ? 'w-8 bg-violet-500/50' : 'w-8 bg-zinc-800'}`} />
        ))}
      </div>

      {/* Step 0 */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Nome da sua marca ou perfil</label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Ex: Lua & Cristais, Astral da Cris..."
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Instagram (opcional)</label>
            <input
              type="text"
              value={instagramHandle}
              onChange={e => setInstagramHandle(e.target.value)}
              placeholder="@seuperfil"
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Descreva seu trabalho</label>
            <textarea
              value={brandDescription}
              onChange={e => setBrandDescription(e.target.value)}
              placeholder="Ex: Sou astróloga e taróloga..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
          <button onClick={() => setStep(1)} className="w-full py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition">
            Continuar
          </button>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Especialidades</label>
            <p className="text-xs text-zinc-500 mb-4">Selecione todas que se aplicam</p>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTIES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleSpecialty(id)}
                  className={`px-3 py-2.5 rounded-lg border text-left text-sm transition ${
                    specialties.includes(id)
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 transition">
              Voltar
            </button>
            <button onClick={() => setStep(2)} disabled={specialties.length === 0} className="flex-1 py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition disabled:opacity-50">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Steps 2-5 seguem padrão similar */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Público-alvo</label>
            <textarea
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Ex: Mulheres de 25-45 anos..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 transition">
              Voltar
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition">
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Cores da marca</label>
            <div className="space-y-2">
              {COLOR_PALETTES.map(({ id, label, colors }) => (
                <button
                  key={id}
                  onClick={() => selectColorPalette(id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition ${
                    brandColors.includes(id)
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {colors.length > 0 && (
                    <div className="flex gap-1">
                      {colors.map(c => (
                        <div key={c} className="w-5 h-5 rounded-full border border-zinc-700" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                  <span className={`text-sm font-medium ${brandColors.includes(id) ? 'text-violet-300' : 'text-zinc-300'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 transition">
              Voltar
            </button>
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition">
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Estilo visual</label>
            <div className="space-y-2">
              {VISUAL_STYLES.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setVisualStyle(id)}
                  className={`w-full flex flex-col px-4 py-3 rounded-lg border transition ${
                    visualStyle === id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className={`text-sm font-medium ${visualStyle === id ? 'text-violet-300' : 'text-zinc-300'}`}>{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 transition">
              Voltar
            </button>
            <button onClick={() => setStep(5)} className="flex-1 py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition">
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Tom de voz</label>
            <div className="space-y-2">
              {VOICE_TONES.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setVoiceTone(id)}
                  className={`w-full flex flex-col px-4 py-3 rounded-lg border transition ${
                    voiceTone === id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className={`text-sm font-medium ${voiceTone === id ? 'text-violet-300' : 'text-zinc-300'}`}>{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:border-zinc-700 transition">
              Voltar
            </button>
            <button onClick={handleFinish} disabled={saving} className="flex-1 py-3 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500 transition disabled:opacity-50">
              {saving ? 'Salvando...' : 'Começar a criar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
