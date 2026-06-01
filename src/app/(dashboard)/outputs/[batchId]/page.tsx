'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Copy, Download, RotateCcw, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Output {
  id: string
  format: string
  content: any
  status: string
}

interface Batch {
  id: string
  theme: string
  status: string
  total_formats: number
  completed_formats: number
  created_at: string
  completed_at: string
  error: string
}

export default function OutputsPage() {
  const params = useParams()
  const batchId = params.batchId as string
  const supabase = createClient()

  const [batch, setBatch] = useState<Batch | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [batchId])

  const loadData = async () => {
    try {
      // Fetch batch
      const { data: batchData } = await supabase
        .from('factory_batches')
        .select('*')
        .eq('id', batchId)
        .single()

      setBatch(batchData)

      // Fetch outputs
      const { data: outputsData } = await supabase
        .from('factory_outputs')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true })

      setOutputs(outputsData || [])
    } catch (err) {
      console.error('Error loading outputs:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const downloadJSON = (output: Output) => {
    const json = JSON.stringify(output.content, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${output.format}-${output.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="max-w-4xl text-center py-12">
        <p className="text-zinc-400">Batch não encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Seus Conteúdos</h1>
        <p className="text-zinc-400 mt-2">{batch.theme}</p>

        {/* Status */}
        <div className="mt-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Status</p>
            <p className={`text-lg font-semibold ${batch.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
              {batch.status === 'completed' ? '✅ Concluído' : '⏳ Processando'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-400">Formatos</p>
            <p className="text-lg font-semibold text-zinc-100">
              {batch.completed_formats}/{batch.total_formats}
            </p>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        {outputs.length === 0 ? (
          <div className="p-8 text-center rounded-lg bg-zinc-900/50 border border-zinc-800">
            <p className="text-zinc-400">Nenhum conteúdo gerado ainda</p>
          </div>
        ) : (
          outputs.map((output) => (
            <OutputCard
              key={output.id}
              output={output}
              expanded={expandedOutput === output.id}
              onToggle={() =>
                setExpandedOutput(expandedOutput === output.id ? null : output.id)
              }
              onCopy={copyToClipboard}
              onDownload={downloadJSON}
              isCopied={copiedId === output.id}
            />
          ))
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8 pt-6 border-t border-zinc-800">
        <a
          href="/factory"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition"
        >
          ← Voltar e gerar novo
        </a>
      </div>
    </div>
  )
}

interface OutputCardProps {
  output: Output
  expanded: boolean
  onToggle: () => void
  onCopy: (text: string, id: string) => void
  onDownload: (output: Output) => void
  isCopied: boolean
}

function OutputCard({
  output,
  expanded,
  onToggle,
  onCopy,
  onDownload,
  isCopied
}: OutputCardProps) {
  const formatLabels: Record<string, string> = {
    carousel: '📊 Carrossel',
    reel: '🎬 Reel/Short',
    caption: '📝 Legenda',
    hashtags: '#️⃣ Hashtags',
    visual_prompt: '🎨 Prompt Visual',
    narration: '🎤 Narração',
    calendar: '📅 Calendário'
  }

  const contentPreview = getContentPreview(output.format, output.content)

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50 hover:border-zinc-700 transition">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl">{formatLabels[output.format]?.charAt(0)}</span>
          <div>
            <p className="font-semibold text-zinc-100">{formatLabels[output.format]}</p>
            <p className="text-xs text-zinc-500">{contentPreview}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-zinc-400" />
        ) : (
          <ChevronDown size={20} className="text-zinc-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-950/50 space-y-4">
          {/* JSON Preview */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-2">JSON</p>
            <pre className="p-3 rounded-lg bg-zinc-800 text-xs text-zinc-300 overflow-x-auto max-h-60 overflow-y-auto">
              {JSON.stringify(output.content, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onCopy(JSON.stringify(output.content, null, 2), output.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
            >
              <Copy size={16} />
              {isCopied ? 'Copiado!' : 'Copiar JSON'}
            </button>
            <button
              onClick={() => onDownload(output)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getContentPreview(format: string, content: any): string {
  if (!content) return ''

  switch (format) {
    case 'carousel':
      return content.slides
        ? `${content.slides.length} slides`
        : 'Carrossel'
    case 'reel':
      return content.hook
        ? content.hook.substring(0, 40) + '...'
        : 'Reel'
    case 'caption':
      return content.hook
        ? content.hook.substring(0, 40) + '...'
        : 'Legenda'
    case 'hashtags':
      return content.high_volume
        ? `${content.high_volume.length} hashtags`
        : 'Hashtags'
    case 'visual_prompt':
      return 'Prompts visuais'
    case 'narration':
      return content.script
        ? content.script.substring(0, 40) + '...'
        : 'Narração'
    case 'calendar':
      return content.posts
        ? `${content.posts.length} dias`
        : 'Calendário'
    default:
      return format
  }
}
