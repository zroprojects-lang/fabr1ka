'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Calendar, Clock, CreditCard, LogOut, Moon, Zap } from 'lucide-react'

interface Props {
  profile: {
    name: string | null
    email: string
    plan: string
    credits_remaining: number
    brand_name?: string | null
    sub_niche?: string | null
  } | null
}

const links = [
  { href: '/factory', label: 'Fábrica de Audiência', icon: Zap },
  { href: '/studio', label: 'Criar conteúdo', icon: Sparkles },
  { href: '/calendar', label: 'Calendário astral', icon: Calendar },
  { href: '/history', label: 'Meus conteúdos', icon: Clock },
  { href: '/pricing', label: 'Planos', icon: CreditCard },
]

export function Sidebar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950">
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          Fabr1ka
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Fábrica de Audiência</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-violet-600/15 text-violet-300'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Créditos hoje</span>
            <span className={`font-medium ${profile?.plan === 'pro' ? 'text-violet-400' : 'text-zinc-300'}`}>
              {profile?.plan === 'pro' ? '∞' : profile?.credits_remaining ?? 0}
            </span>
          </div>
          {profile?.plan === 'free' && (
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${((profile?.credits_remaining ?? 0) / 10) * 100}%` }}
              />
            </div>
          )}
          {profile?.plan === 'free' && (
            <Link href="/pricing" className="block text-xs text-violet-400 hover:underline mt-2">
              Fazer upgrade →
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">{profile?.brand_name || profile?.name || 'Usuário'}</p>
            <p className="text-xs text-zinc-600 truncate">{profile?.sub_niche || profile?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-zinc-300 transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
