// Single place every form on the site sends its data.
//
import { API_BASE, errorMessage } from './api.js'

const DEMO = import.meta.env.VITE_FORM_DEMO === 'true'

export async function submitForm(formName, data) {
  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (data._gotcha) return { ok: true }

  const payload = { form: formName, ...data }
  delete payload._gotcha

  if (DEMO) {
    console.info(`[demo] "${formName}" form submitted (no endpoint set):`, payload)
    await new Promise((resolve) => setTimeout(resolve, 700))
    return { ok: true, demo: true }
  }

  let response
  try {
    response = await fetch(`${API_BASE}/public/forms/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('We could not reach the server. Check your connection and try again.')
  }

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(errorMessage(result, 'Something went wrong sending your details. Please try again.'))
  }
  return { ok: true, ...result }
}
