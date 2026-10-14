// ─────────────────────────────────────────────────────────────
// Supabase configuration — the only place the URL and key are read.
// Values come from Vite env variables (.env locally, repository
// variables in GitHub Actions). They are PUBLIC once bundled, which is
// fine for a publishable key; never use a secret/service_role key here.
// ─────────────────────────────────────────────────────────────

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()

export const supabaseConfig = {
  url,
  publishableKey,
  restUrl: url ? `${url}/rest/v1` : '',
  contactTable: 'contact_to_me',
}

/** True when both values are present, so the contact form can submit. */
export const isSupabaseConfigured = Boolean(url && publishableKey)
