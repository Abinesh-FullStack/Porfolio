import { useId, useRef, useState } from 'react'
import { Mail, Send, Copy, Check, CircleCheck, CircleAlert, Loader2, ArrowUpRight } from 'lucide-react'
import { LinkedInIcon, GitHubIcon } from '../components/BrandIcons.jsx'
import { useReveal } from '../hooks/useGSAPAnimations.js'
import { profile, hasRealEmail } from '../data/profile.js'
import { isSupabaseConfigured } from '../config/supabase.js'
import { submitContact, validateContact, LIMITS } from '../lib/contactApi.js'

const EMPTY = { name: '', email: '', message: '' }

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label} <span className="text-accent" aria-hidden="true">*</span>
        </label>
        {hint}
      </div>
      {children}
      <p id={`${id}-error`} className={`mt-1.5 flex items-center gap-1.5 text-[0.82rem] text-[#b42318] ${error ? '' : 'hidden'}`}>
        <CircleAlert size={14} aria-hidden="true" />
        {error}
      </p>
    </div>
  )
}

function ContactForm() {
  const uid = useId()
  const ids = { name: `${uid}-name`, email: `${uid}-email`, message: `${uid}-message` }
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [serverError, setServerError] = useState('')
  const sending = useRef(false) // synchronous guard against double submits
  const formRef = useRef(null)

  const update = (key) => (e) => {
    const next = { ...values, [key]: e.target.value }
    setValues(next)
    if (status === 'success' || status === 'error') setStatus('idle')
    if (touched[key]) setErrors(validateContact(next))
  }
  const blur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validateContact(values))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (sending.current) return

    const found = validateContact(values)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(found).length) {
      const first = ['name', 'email', 'message'].find((k) => found[k])
      document.getElementById(ids[first])?.focus()
      return
    }
    // Honeypot: real visitors never see or fill this field.
    if (formRef.current?.elements.company?.value) {
      setStatus('error')
      setServerError('Your message couldn’t be sent. Please try again.')
      return
    }

    sending.current = true
    setStatus('sending')
    setServerError('')
    try {
      await submitContact(values)
      setStatus('success')
      setValues(EMPTY)
      setTouched({})
      setErrors({})
    } catch (err) {
      setStatus('error')
      setServerError(err.message)
    } finally {
      sending.current = false
    }
  }

  const input =
    'w-full rounded-lg border bg-surface px-3.5 py-3 text-[0.97rem] text-ink placeholder:text-ink-3/70 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60'
  const tone = (k) =>
    errors[k] && touched[k] ? 'border-[#e5a9a2] focus:border-[#d0574a] focus:ring-[#d0574a]/12' : 'border-line hover:border-ink/25 focus:border-accent focus:ring-accent/12'
  const disabled = !isSupabaseConfigured || status === 'sending'
  const len = values.message.trim().length

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-8" aria-labelledby={`${uid}-title`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id={`${uid}-title`} className="text-xl font-semibold tracking-tight text-ink">
            Send me a message
          </h3>
          <p className="mt-1 text-sm text-ink-3">Messages are saved securely and I’ll follow up by email.</p>
        </div>
        <span className="hidden rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-deep sm:inline">All fields required</span>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id={ids.name} label="Full Name" error={touched.name && errors.name}>
          <input
            id={ids.name}
            name="name"
            autoComplete="name"
            maxLength={LIMITS.name[1]}
            value={values.name}
            onChange={update('name')}
            onBlur={blur('name')}
            aria-invalid={Boolean(touched.name && errors.name)}
            aria-describedby={`${ids.name}-error`}
            className={`${input} ${tone('name')}`}
            placeholder="Your full name"
            disabled={disabled}
            required
          />
        </Field>
        <Field id={ids.email} label="Email Address" error={touched.email && errors.email}>
          <input
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITS.email[1]}
            value={values.email}
            onChange={update('email')}
            onBlur={blur('email')}
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={`${ids.email}-error`}
            className={`${input} ${tone('email')}`}
            placeholder="you@company.com"
            disabled={disabled}
            required
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          id={ids.message}
          label="Message"
          error={touched.message && errors.message}
          hint={
            <span className={`font-mono text-[0.72rem] ${len > LIMITS.message[1] ? 'text-[#b42318]' : 'text-ink-3'}`} aria-hidden="true">
              {len}/{LIMITS.message[1]}
            </span>
          }
        >
          <textarea
            id={ids.message}
            name="message"
            rows={6}
            maxLength={LIMITS.message[1]}
            value={values.message}
            onChange={update('message')}
            onBlur={blur('message')}
            aria-invalid={Boolean(touched.message && errors.message)}
            aria-describedby={`${ids.message}-error`}
            className={`${input} ${tone('message')} resize-y leading-relaxed`}
            placeholder="Tell me about the role, project or idea…"
            disabled={disabled}
            required
          />
        </Field>
      </div>

      {/* honeypot — hidden from people and assistive tech */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="status" aria-live="polite" className="min-h-[1.5rem] text-sm">
          {!isSupabaseConfigured && <p className="text-ink-3">The contact form isn’t connected yet — please use LinkedIn for now.</p>}
          {status === 'success' && (
            <p className="flex items-start gap-2 font-medium text-mint">
              <CircleCheck size={18} className="mt-px shrink-0" aria-hidden="true" />
              Thank you — your message has been sent. I’ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className="flex items-start gap-2 text-[#b42318]">
              <CircleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
              {serverError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled}
          aria-busy={status === 'sending'}
          className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-medium text-paper shadow-[0_12px_28px_-14px_rgb(14_26_43/0.7)] transition-[background,transform,box-shadow] duration-300 hover:bg-accent-deep hover:shadow-[0_14px_30px_-12px_rgb(47_91_234/0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/40 disabled:shadow-none"
        >
          {status === 'sending' ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <Send size={16} className="transition-transform duration-300 group-enabled:group-hover:-translate-y-0.5 group-enabled:group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function ContactLink({ href, icon: Icon, label, sub }) {
  return (
    <a
      href={href}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-4 border-b border-line py-4 transition-colors first:border-t hover:text-accent-deep"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink shadow-[var(--shadow-card)] transition-colors duration-300 group-hover:bg-ink group-hover:text-paper">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink group-hover:text-accent-deep">{label}</span>
        <span className="block truncate text-sm text-ink-3">{sub}</span>
      </span>
      <ArrowUpRight size={18} className="text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </a>
  )
}

export default function Contact() {
  const scope = useRef(null)
  const [copied, setCopied] = useState(false)
  useReveal(scope)
  const emailReady = hasRealEmail()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section id="contact" ref={scope} aria-labelledby="contact-title" className="relative overflow-hidden bg-mist py-20 sm:py-28">
      <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow flex items-center gap-3" data-reveal>
            <span className="text-accent">07</span>
            <span className="h-px w-8 bg-ink/15" aria-hidden="true" />
            Contact
          </p>
          <h2 id="contact-title" className="display mt-5 text-[2.5rem] text-ink sm:text-[3.4rem] lg:text-[3.9rem]">
            <span data-reveal-words>Let’s Build Something</span>{' '}
            <span className="serif-accent text-accent" data-reveal-words>
              Meaningful.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2" data-reveal>
            I’m interested in opportunities involving full stack development, automation testing, and data analytics.
          </p>

          <div className="mt-10 max-w-md" data-reveal>
            <ContactLink href={profile.links.linkedin} icon={LinkedInIcon} label="LinkedIn" sub="in/abinesh-v-7496b32b2" />
            <ContactLink href={profile.links.github} icon={GitHubIcon} label="GitHub" sub="github.com/Abinesh-FullStack" />
            {emailReady && (
              <div className="relative">
                <ContactLink href={`mailto:${profile.email}`} icon={Mail} label="Email" sub={profile.email} />
                <button
                  type="button"
                  onClick={copy}
                  className="absolute right-9 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-3 transition hover:bg-surface hover:text-ink"
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
