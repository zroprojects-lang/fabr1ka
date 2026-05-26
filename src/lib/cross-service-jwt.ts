/**
 * Validação de JWT cross-service (Cosmos → OráculoAI)
 * Permite autenticação federated entre sistemas.
 */

import { jwtVerify } from 'jose'

export interface CrossServicePayload {
  therapist_id: string
  name: string
  email: string
  specialties: string[]
  brand_colors: string[]
  voice_tone: string
  from_service: 'cosmos' | string
  iat: number
  exp: number
  type: 'cross_service'
}

/**
 * Valida token JWT do Cosmos.
 * Retorna payload se válido, null se inválido.
 */
export async function validateCrossServiceToken(
  token: string,
): Promise<CrossServicePayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.CROSS_SERVICE_SECRET || 'dev-cross-service-secret'
    )

    const verified = await jwtVerify(token, secret)
    const payload = verified.payload as unknown as CrossServicePayload

    // Validações adicionais
    if (payload.type !== 'cross_service') {
      console.warn('Token type invalid:', payload.type)
      return null
    }

    if (payload.from_service !== 'cosmos') {
      console.warn('Token from_service invalid:', payload.from_service)
      return null
    }

    return payload
  } catch (error) {
    console.error('JWT validation error:', error)
    return null
  }
}

/**
 * Extrai token da query string e valida.
 */
export async function extractAndValidateToken(
  searchParams: Record<string, string | string[] | undefined>
): Promise<CrossServicePayload | null> {
  const token = Array.isArray(searchParams.token)
    ? searchParams.token[0]
    : searchParams.token

  if (!token) {
    return null
  }

  return validateCrossServiceToken(token)
}
