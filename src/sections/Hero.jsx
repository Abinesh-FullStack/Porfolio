import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Braces, CheckCircle2 } from 'lucide-react'
import { gsap, useGSAP, MOTION_OK, useReducedMotion, useFinePointer, hasWebGL } from '../hooks/useGSAPAnimations.js'
import AnimatedButton from '../components/AnimatedButton.jsx'
import { LinkedInIcon, GitHubIcon } from '../components/BrandIcons.jsx'
import { asset, profile } from '../data/profile.js'

// Three.js and the workspace scene load in their own chunk, after the text is on screen.
const DeveloperScene = lazy(() => import('../components/3d/DeveloperScene.jsx'))

// Pre-rendered first frame of the same scene: shows instantly, and remains the
// visual where live 3D isn't used (no WebGL, data-saver, very low-memory devices).
const POSTER = 'images/hero-scene.webp'

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

function useCan3D() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    const saveData = navigator.connection?.saveData
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2
    return hasWebGL() && !saveData && !lowMemory
  }, [])
}

export default function Hero() {
  const section = useRef(null)
  const stage = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const reduced = useReducedMotion()
  const finePointer = useFinePointer()
  const can3D = useCan3D()
  const compact = useMedia('(max-width: 1023px)')
  const [sceneReady, setSceneReady] = useState(false)
  const [inView, setInView] = useState(true)
  const [hi, setHi] = useState('idle') // idle → show → done (once per page load)

  // Character animation state, read every frame by the 3D rig and tweened by GSAP.
  // look: 1 = facing the visitor · wave: raised hand · smile: open smile · typing: hands busy
  const anim = useRef({ look: 0, wave: 0, smile: 0, typing: 0 })
  const introPlayed = useRef(false)
  const introTl = useRef(null)

  // The greeting sequence, orchestrated with a GSAP timeline once the scene is live.
  const playIntro = useCallback(() => {
    if (introPlayed.current) return
    introPlayed.current = true
    const a = anim.current
    if (reduced) {
      Object.assign(a, { look: 0, wave: 0, smile: 0, typing: 0 })
      setHi('show')
      return
    }
    introTl.current = gsap
      .timeline({ delay: 0.5 })
      .to(a, { look: 1, duration: 0.75, ease: 'power2.inOut' }) // looks up at the visitor
      .to(a, { smile: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35') // smiles
      .to(a, { wave: 1, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.1') // raises a hand
      .call(() => setHi('show'), null, '-=0.35') // "HI 👋" appears
      .to(a, { wave: 0, duration: 0.65, ease: 'power2.inOut' }, '+=2.1') // lowers the hand
      .to(a, { smile: 0, duration: 0.6, ease: 'power2.inOut' }, '<')
      .to(a, { look: 0, duration: 0.85, ease: 'power2.inOut' }, '<0.15') // back to the laptop
      .to(a, { typing: 1, duration: 0.6, ease: 'power1.inOut' }, '-=0.35') // starts coding
      .call(() => setHi('done'), null, '+=1.4')
  }, [reduced])

  useEffect(() => () => introTl.current?.kill(), [])
  // The bubble never lingers: hide it a few seconds after it appears (covers every path).
  useEffect(() => {
    if (hi !== 'show') return
    const id = setTimeout(() => setHi('done'), 6500)
    return () => clearTimeout(id)
  }, [hi])

  // Without live 3D the greeting still appears, once.
  useEffect(() => {
    if (can3D) return
    const show = setTimeout(() => setHi((h) => (h === 'idle' ? 'show' : h)), 800)
    const hide = setTimeout(() => setHi('done'), 4800)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [can3D])
  // Safety net: if WebGL is very slow to start, don't hold the greeting back.
  useEffect(() => {
    if (!can3D) return
    const id = setTimeout(() => {
      if (!introPlayed.current) {
        introPlayed.current = true
        setHi('show')
        Object.assign(anim.current, { typing: 1 })
        setTimeout(() => setHi('done'), 4000)
      }
    }, 7000)
    return () => clearTimeout(id)
  }, [can3D])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '80px' })
    if (section.current) io.observe(section.current)
    return () => io.disconnect()
  }, [])

  const onReady = useCallback(() => {
    setTimeout(() => {
      setSceneReady(true)
      playIntro()
    }, 200)
  }, [playIntro])

  // Page-load entrance for the copy and the scene card.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from('[data-hero-in]', { y: 22, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.05 })
        gsap.from(stage.current, { y: 28, scale: 0.98, autoAlpha: 0, duration: 1.0, ease: 'power3.out', delay: 0.15 })
        gsap.from('[data-hero-chip]', { y: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15, delay: 1.0 })
      })
    },
    { scope: section },
  )

  // Desktop pointer → tiny camera parallax inside the scene.
  useEffect(() => {
    if (!finePointer || reduced) return
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [finePointer, reduced])

  return (
    <section id="home" ref={section} aria-label="Introduction" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(50%_55%_at_76%_45%,#e8edfb_0%,rgba(248,247,244,0)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
      </div>

      <div className="container-x relative grid items-center gap-10 pb-14 pt-24 lg:min-h-[100svh] lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:pb-12 lg:pt-24">
        {/* ── Copy ── */}
        <div className="relative z-10 max-w-[35rem]">
          <p data-hero-in className="flex items-center gap-3 text-[0.95rem] font-medium text-ink-2">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Hello, welcome to my portfolio
          </p>

          <h1 className="mt-5">
            <span data-hero-in className="display block text-[3.2rem] text-ink sm:text-[4.4rem] lg:text-[4.6rem] xl:text-[5.2rem]">
              {profile.name}.
            </span>
            <span data-hero-in className="serif-accent mt-1 block text-[2.3rem] leading-[1.05] text-accent sm:text-[3rem] xl:text-[3.4rem]">
              Full Stack Developer
            </span>
          </h1>

          <p data-hero-in className="mt-5 flex flex-wrap items-center gap-2">
            {['Automation Testing', 'Data Analytics'].map((r) => (
              <span key={r} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-[var(--shadow-card)]">
                {r}
              </span>
            ))}
          </p>

          <p data-hero-in className="mt-6 max-w-[32rem] text-[1.06rem] leading-relaxed text-ink-2">
            I build web applications end to end, test them so they work the way they should, and turn data into clear insight — currently
            at {profile.company}.
          </p>

          <div data-hero-in className="mt-8 flex flex-wrap items-center gap-3">
            <AnimatedButton href="#projects">View My Projects</AnimatedButton>
            <AnimatedButton href="#contact" variant="secondary">
              Contact Me
            </AnimatedButton>
          </div>

          <div data-hero-in className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2 text-ink-3">
              <span className="status-dot h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
              {profile.role} · {profile.company.replace(' Pvt Ltd', '')}
            </span>
            <span className="flex items-center gap-1">
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in new tab)" className="grid h-10 w-10 place-items-center rounded-full text-ink-2 transition hover:-translate-y-0.5 hover:bg-surface hover:text-accent-deep hover:shadow-[var(--shadow-card)]">
                <LinkedInIcon size={17} />
              </a>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in new tab)" className="grid h-10 w-10 place-items-center rounded-full text-ink-2 transition hover:-translate-y-0.5 hover:bg-surface hover:text-accent-deep hover:shadow-[var(--shadow-card)]">
                <GitHubIcon size={17} />
              </a>
            </span>
          </div>
        </div>

        {/* ── Developer workspace ── */}
        <div ref={stage} className="relative mx-auto w-full max-w-[36rem] lg:max-w-none">
          <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[1.6rem] border border-line bg-[#e4ddd3] shadow-[0_2px_4px_rgb(18_26_41/0.04),0_40px_80px_-40px_rgb(18_26_41/0.45)] lg:aspect-auto lg:h-[min(80vh,46rem)]">
            <img
              src={asset(POSTER)}
              alt={can3D ? '' : 'A 3D cartoon developer sitting at his desk, coding on a laptop'}
              aria-hidden={can3D ? 'true' : undefined}
              width="900"
              height="1040"
              decoding="async"
              fetchPriority="high"
              onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
            />
            {can3D && (
              <div className={`absolute inset-0 transition-opacity duration-700 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
                <Suspense fallback={null}>
                  <DeveloperScene anim={anim} pointerRef={pointerRef} reduced={reduced} compact={compact} active={inView} onReady={onReady} />
                </Suspense>
              </div>
            )}
            {can3D && <span className="sr-only">Illustration: a 3D cartoon developer waves hello, then keeps coding on his laptop.</span>}

            {/* greeting bubble */}
            <div
              aria-live="polite"
              className={`pointer-events-none absolute right-[3%] top-[3%] z-20 origin-bottom-left transition-[opacity,transform] duration-500 ease-out sm:right-[8%] sm:top-[9%] ${
                hi === 'show' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              {hi === 'show' && (
                <div className="relative rounded-2xl rounded-bl-[6px] bg-surface px-4 py-2.5 shadow-[0_18px_40px_-18px_rgb(18_26_41/0.5)] sm:px-5 sm:py-3.5">
                  <p className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    HI <span className="wave">👋</span>
                  </p>
                  <p className="mt-0.5 text-[0.8rem] font-medium text-ink-2 sm:text-sm">Hey, I’m Abinesh!</p>
                  <span className="absolute -bottom-[7px] left-3 h-3.5 w-3.5 rotate-45 bg-surface" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* floating programming chips (desktop) */}
          <div data-hero-chip className="float-slow absolute -left-6 top-[14%] hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[0.72rem] text-ink-2 shadow-[var(--shadow-lift)] lg:flex">
            <Braces size={14} className="text-accent" aria-hidden="true" />
            React · FastAPI · Django
          </div>
          <div data-hero-chip className="float-slow absolute -right-4 bottom-[12%] hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[0.72rem] text-ink-2 shadow-[var(--shadow-lift)] lg:flex" style={{ animationDelay: '-3s' }}>
            <CheckCircle2 size={14} className="text-mint" aria-hidden="true" />
            pytest · tests passing
          </div>
        </div>
      </div>
    </section>
  )
}
