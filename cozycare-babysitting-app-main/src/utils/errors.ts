export class AuthSessionError extends Error {
  constructor(message = 'Your session needs to be refreshed. Please sign in again.') {
    super(message)
    this.name = 'AuthSessionError'
  }
}

export function isAuthSessionError(error: unknown): error is AuthSessionError {
  return error instanceof AuthSessionError
}

export function isAuthFailureError(error: unknown): boolean {
  if (isAuthSessionError(error)) {
    return true
  }

  const candidate = error as {
    status?: number
    statusCode?: number
    code?: string
    name?: string
    message?: string
    details?: { error?: string }
  } | null

  const status = candidate?.status ?? candidate?.statusCode
  const message = candidate?.message?.toLowerCase() ?? ''
  const detail = candidate?.details?.error?.toLowerCase() ?? ''
  const name = candidate?.name?.toLowerCase() ?? ''

  return status === 401 ||
    status === 403 ||
    candidate?.code === 'NETWORK_ERROR' ||
    name.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('http 403') ||
    detail.includes('projectid missing in token')
}
