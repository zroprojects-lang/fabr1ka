'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader, Zap, AlertCircle } from 'lucide-react'

type Format = 'carousel' | 'reel' | 'caption' | 'hashtags' | 'visual_prompt' | 'narration' | 'calendar'

const FORMATS = [
  {
    id: 'carousel' as Format,
    name: '📊 Carrossel',
    desc: '7 slides estruturados com visual',
    icon: '📊'
  },
  {
    id: 'reel' as Format,
    name: '🎬 Reel/Short',
    desc: 'Script com timing + cenas',
    icon: '🎬'
  },
  {
    id: 'caption' as Format,
    name: '📝 Legenda',
    desc: 'Hook + corpo + CTA',
    icon: '📝'
  },
  {
    id: 'hashtags' as Format,
    name: '#️⃣ Hashtags',
    desc: 'Segmentadas (alto, médio, nicho)',
    icon: '#️⃣'
  },
  {
    id: 'visual_prompt' as Format,
    name: '🎨 Prompt Visual',
    desc: 'Para Midjourney/DALL-E/Canva',
    icon: '🎨'
  },
  {
    id: 'narration' as Format,
    name: '🎤 Narração',
    desc: 'Script pronto para TTS',
    icon: '🎤'
  },
  {
    id: 'calendar' as Format,
    name: '📅 Calendário',
    desc: 'Editorial 7-30 dias',
    icon: '📅'
  }
]

export default function FactoryPage() {
  const router = useRouter()
  const [theme, setTheme] = useState('')
  const [product, setProduct] = useState('')
  const [target, setTarget] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(['carousel', 'caption', 'hashtags'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleFormat = (format: Format) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!theme.trim()) {
      setError('Digite uma ideia ou tema')
      return
    }

    if (selectedFormats.length === 0) {
      setError('Selecione pelo menos 1 formato')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          context: {
            ...(product && { product: product.trim() }),
            ...(target && { target: target.trim() })
          },
          formats: selectedFormats
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdos')
      }

      // Redirect para outputs
      router.push(`/outputs/${data.batch_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
          <Zap className="text-amber-400" size={32} />
          Fábrica de Audiência
        </h1>
        <p className="text-zinc-400 mt-2">Transforme 1 ideia em 10+ formatos prontos para redes sociais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Theme */}
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
          <label className="block text-sm font-semibold text-zinc-300 mb-3">
            💡 Qual é sua ideia?
          </label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Como superar procrastinação no trabalho..."
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none"
            rows={3}
            disabled={loading}
          />
          <p className="text-xs text-zinc-500 mt-2">
            Seja específico: temas claros geram conteúdos melhores
          </p>
        </div>

        {/* Context (Optional) */}
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
          <label className="block text-sm font-semibold text-zinc-300 mb-3">
            📦 Contexto adicional (opcional)
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Produto/Serviço (ex: Curso de produtividade)"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none text-sm"
              disabled={loading}
            />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Público-alvo (ex: Empreendedores iniciantes)"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {/* Format Selection */}
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
          <label className="block text-sm font-semibold text-zinc-300 mb-4">
            📋 Quais formatos você quer?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => toggleFormat(format.id)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedFormats.includes(format.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-semibold text-zinc-100">{format.name}</div>
                <div className="text-xs text-zinc-400 mt-1">{format.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            {selectedFormats.length} formato(s) selecionado(s)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !theme.trim() || selectedFormats.length === 0}
          className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            loading || !theme.trim() || selectedFormats.length === 0
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
          }`}
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Gerando conteúdos...
            </>
          ) : (
            <>
              <Zap size={18} />
              Gerar Conteúdos
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
        <p className="font-semibold mb-2">⚡ Dica:</p>
        <ul className="space-y-1 text-xs">
          <li>• Quanto mais específico o tema, melhor a qualidade</li>
          <li>• Todos os formatos são gerados em paralelo</li>
          <li>• Cada geração conta como 1 uso do seu plano</li>
        </ul>
      </div>
    </div>
  )
}
