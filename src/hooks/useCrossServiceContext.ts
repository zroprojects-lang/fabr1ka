'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { validateCrossServiceToken, CrossServicePayload } from '@/lib/cross-service-jwt'

/**
 * Hook para validar e extrair contexto cross-service.
 * Usado no onboarding para pré-preencher dados do Cosmos.
 */
export function useCrossServiceContext() {
  const searchParams = useSearchParams()
  const [context, setContext] = useState<CrossServicePayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validateToken() {
      const token = searchParams?.get('token')

      if (!token) {
        setLoading(false)
        return
      }

      const payload = await validateCrossServiceToken(token)
      if (payload) {
        setContext(payload)
      }

      setLoading(false)
    }

    validateToken()
  }, [searchParams])

  return { context, loading }
}
