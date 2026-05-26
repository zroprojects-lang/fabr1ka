import { ReactNode } from 'react'
import { redirect } from 'next/navigation'

interface OnboardingLayoutProps {
  children: ReactNode
  searchParams: Record<string, string | string[] | undefined>
}

/**
 * Layout server-side para capturar token cross-service do Cosmos.
 * Se houver token, injeta em context para o cliente usar.
 */
export default async function OnboardingLayout({
  children,
  searchParams,
}: OnboardingLayoutProps) {
  // Se houver token, validar e passar como context (será feito no page.tsx com useSearchParams)
  // Aqui apenas passamos o layout, a validação real acontece no client

  return <>{children}</>
}
