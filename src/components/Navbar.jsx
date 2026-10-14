import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, profile } from '../data/profile.js'
import { useActiveSection } from '../hooks/useGSAPAnimations.js'

const ids = navLinks.map((l) => l.id)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const barRef = useRef(null)
  const active = useActiveSection(ids)
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12)
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Mobile panel: Escape closes, focus moves in and back out, body scroll locks.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('a')?.focus()
    const btn = btnRef.current
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      btn?.focus()
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <div
        className={`transition-[background,box-shadow,border-color,backdrop-filter] duration-300 ${
          scrolled || open ? 'border-b border-line/80 bg-paper/80 shadow-[0_8px_30px_-20px_rgb(14_26_43/0.35)] backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between" aria-label="Primary">
          <a href="#home" className="text-[1.05rem] font-bold tracking-[-0.02em] text-ink" onClick={() => setOpen(false)}>
            {profile.brand.replace('.', '')}
            <span className="text-accent">.</span>
          </a>

          <ul className="ml-auto mr-4 hidden items-center gap-0.5 lg:flex">
            {navLinks.map((l) => {
              const isActive = active === l.id
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative rounded-full px-3 py-2 text-[0.88rem] transition-colors ${isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
                  >
                    <span className="link-underline pb-0.5" aria-current={isActive ? 'true' : undefined}>
                      {l.label}
                    </span>
                    {isActive && <span className="absolute left-1/2 top-[3px] h-1 w-1 -translate-x-1/2 rounded-full bg-accent" aria-hidden="true" />}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a href="#contact" className="hidden rounded-full bg-ink px-4 py-2 text-[0.85rem] font-medium text-paper transition hover:bg-accent-deep sm:inline-flex">
              Contact me
            </a>
            <button
              ref={btnRef}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
        {/* reading progress */}
        <div ref={barRef} className="h-[2px] origin-left scale-x-0 bg-accent/80" aria-hidden="true" />
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        ref={panelRef}
        className={`fixed inset-x-0 top-[66px] bottom-0 bg-paper/95 backdrop-blur-xl transition-[opacity,visibility] duration-300 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul className="container-x flex flex-col pt-4">
          {navLinks.map((l, i) => (
            <li key={l.id} className="border-b border-line">
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-baseline justify-between py-4 text-2xl font-semibold tracking-tight transition-[transform,color] duration-500 ${
                  open ? 'translate-y-0' : 'translate-y-3'
                } ${active === l.id ? 'text-accent' : 'text-ink'}`}
                style={{ transitionDelay: open ? `${i * 35}ms` : '0ms' }}
                tabIndex={open ? 0 : -1}
              >
                {l.label}
                <span className="font-mono text-xs text-ink-3">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
