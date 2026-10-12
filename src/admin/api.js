import { API_BASE, errorMessage } from '../lib/api.js'

const ACCESS_KEY = 'acel-admin-access'
const REFRESH_KEY = 'acel-admin-refresh'

export const getAccessToken = () => sessionStorage.getItem(ACCESS_KEY)

export function clearAdminSession() {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(errorMessage(data))
  return data
}

export async function signIn(username, password) {
  let response
  try {
    response = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new Error('Could not reach the administration server.')
  }
  const tokens = await readResponse(response)
  sessionStorage.setItem(ACCESS_KEY, tokens.access)
  sessionStorage.setItem(REFRESH_KEY, tokens.refresh)
}

export async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const send = (token) => fetch(`${API_BASE}${path}`, {
    ...options,
    headers: new Headers([...headers, ['Authorization', `Bearer ${token}`]]),
  })

  let response
  try {
    response = await send(getAccessToken())
  } catch {
    throw new Error('Could not reach the administration server.')
  }

  if (response.status === 401 && sessionStorage.getItem(REFRESH_KEY)) {
    try {
      const refreshed = await fetch(`${API_BASE}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: sessionStorage.getItem(REFRESH_KEY) }),
      })
      const tokens = await readResponse(refreshed)
      sessionStorage.setItem(ACCESS_KEY, tokens.access)
      response = await send(tokens.access)
    } catch {
      clearAdminSession()
      window.dispatchEvent(new Event('admin:unauthorized'))
      throw new Error('Your admin session has expired. Please sign in again.')
    }
  }

  if (response.status === 401) {
    clearAdminSession()
    window.dispatchEvent(new Event('admin:unauthorized'))
  }
  return readResponse(response)
}