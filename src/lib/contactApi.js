import { supabaseConfig, isSupabaseConfigured } from '../config/supabase.js'

/* ── Validation (shared by the form and the request layer) ── */

export const LIMITS = { name: [2, 100], email: [6, 254], message: [10, 2000] }

// Practical email check: something@something.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact({ name = '', email = '', message = '' }) {
  const errors = {}
  const n = name.trim()
  const e = email.trim()
  const m = message.trim()

  if (!n) errors.name = 'Please enter your full name.'
  else if (n.length < LIMITS.name[0]) errors.name = 'Your name looks too short.'
  else if (n.length > LIMITS.name[1]) errors.name = `Please keep your name under ${LIMITS.name[1]} characters.`

  if (!e) errors.email = 'Please enter your email address.'
  else if (e.length > LIMITS.email[1] || !EMAIL_RE.test(e)) errors.email = 'Please enter a valid email address, like name@example.com.'

  if (!m) errors.message = 'Please write a short message.'
  else if (m.length < LIMITS.message[0]) errors.message = `Please add a little more detail (at least ${LIMITS.message[0]} characters).`
  else if (m.length > LIMITS.message[1]) errors.message = `Please keep your message under ${LIMITS.message[1]} characters.`

  return errors
}

/* ── Request ── */

export class ContactError extends Error {
  constructor(message, kind) {
    super(message)
    this.kind = kind // 'config' | 'network' | 'timeout' | 'rejected' | 'server'
  }
}

/**
 * Inserts one row into `contact_to_me` through Supabase's REST API (PostgREST).
 * - POST with `Prefer: return=minimal` → Supabase replies 201 with no body, so the
 *   anonymous visitor never needs (or gets) permission to read rows back.
 * - The publishable key goes in the `apikey` header only (it is not a JWT, so it
 *   must not be sent as `Authorization: Bearer`).
 * Resolves only when the database confirms the insert (HTTP 201).
 */
export async function submitContact({ name, email, message }, { timeoutMs = 15000 } = {}) {
  if (!isSupabaseConfigured) {
    throw new ContactError('The contact form is not configured yet.', 'config')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetch(`${supabaseConfig.restUrl}/${supabaseConfig.contactTable}`, {
      method: 'POST',
      headers: {
        apikey: supabaseConfig.publishableKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        contact_name: name.trim(),
        contact_email: email.trim(),
        description: message.trim(),
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ContactError('The request took too long. Please check your connection and try again.', 'timeout')
    }
    throw new ContactError('Couldn’t reach the server. Please check your internet connection and try again.', 'network')
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 201 || res.status === 204) return true

  // Read PostgREST's error body for logging; never show raw details to visitors.
  let detail = ''
  try {
    const body = await res.json()
    detail = [body.code, body.message].filter(Boolean).join(' ')
  } catch {
    /* empty body */
  }
  if (import.meta.env.DEV) console.warn('[contact] Supabase insert failed', res.status, detail)

  if (res.status === 401 || res.status === 403) {
    throw new ContactError('The form isn’t accepting messages right now. Please reach out on LinkedIn instead.', 'rejected')
  }
  if (res.status === 400 || res.status === 422) {
    throw new ContactError('Some details weren’t accepted. Please check the form and try again.', 'rejected')
  }
  if (res.status === 429) {
    throw new ContactError('Too many messages in a short time. Please wait a minute and try again.', 'rejected')
  }
  throw new ContactError('Something went wrong on our side. Please try again in a moment.', 'server')
}
