export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export function errorMessage(data, fallback = 'The request could not be completed.') {
  if (typeof data?.detail === 'string') return data.detail
  for (const value of Object.values(data || {})) {
    if (typeof value === 'string') return value
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    if (Array.isArray(value) && typeof value[0] === 'object' && value[0] !== null) {
      return Object.values(value[0]).find((nested) => typeof nested === 'string') || fallback
    }
  }
  return fallback
}

export async function requestJson(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error('We could not reach the server. Check your connection and try again.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(errorMessage(data))
  return data
}