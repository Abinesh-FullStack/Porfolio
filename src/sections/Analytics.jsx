import { useRef } from 'react'
import { Database, Filter, Shuffle, Search, LayoutDashboard, Lightbulb } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import { analyticsSteps, analyticsTools } from '../data/workflows.js'
import { gsap, useGSAP, useReveal, MOTION_OK } from '../hooks/useGSAPAnimations.js'

const icons = [Database, Filter, Shuffle, Search, LayoutDashboard, Lightbulb]

export default function Analytics() {
  const scope = useRef(null)
  useReveal(scope)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // connection line grows with scroll; steps light up as it passes
        gsap.fromTo(
          '[data-flow-fill]',
          { scaleX: 0, scaleY: 0 },
          { scaleX: 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-flow]', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } },
        )
        gsap.utils.toArray('[data-flow-step]').forEach((el, i) => {
          gsap.from(el, {
            y: 30,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.05,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        // illustrative bars grow
        gsap.from('[data-bar]', {
          scaleY: 0,
          transformOrigin: 'bottom',
          duration: 1,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: '[data-chart]', start: 'top 80%', once: true },
        })
        gsap.from('[data-line-path]', {
          strokeDashoffset: 400,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: '[data-chart]', start: 'top 80%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section id="analytics" ref={scope} aria-labelledby="analytics-title" className="relative overflow-hidden section-y">

      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <SectionHeading stacked id="analytics-title" index="05" eyebrow="Data analytics" title="Turning Data into" accent="Meaningful Insights.">
            A repeatable process for going from raw, messy data to dashboards and reports people can actually use.
          </SectionHeading>

          {/* illustrative chart */}
          <figure className="card p-5" data-chart data-reveal>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">KPI overview</p>
              <span className="rounded-full bg-mist px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-ink-3">Illustrative</span>
            </div>
            <div className="relative mt-4 h-40">
              <div className="absolute inset-0 flex items-end gap-2.5">
                {[42, 58, 50, 66, 61, 78, 72, 88].map((h, i) => (
                  <span key={i} data-bar className="flex-1 rounded-t-md bg-accent-soft" style={{ height: `${h}%` }} />
                ))}
              </div>
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path data-line-path d="M6 70 L32 52 L57 60 L82 40 L107 46 L132 26 L157 32 L182 14 L194 10" fill="none" stroke="#2f5bea" strokeWidth="2.2" strokeDasharray="400" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <figcaption className="mt-3 text-xs text-ink-3">Sample visual only — not real project data.</figcaption>
          </figure>
        </div>

        {/* workflow */}
        <div data-flow className="relative mt-16">
          {/* desktop horizontal connector */}
          <span className="absolute left-[8%] right-[8%] top-7 hidden h-[2px] bg-line lg:block" aria-hidden="true" />
          <span data-flow-fill className="absolute left-[8%] right-[8%] top-7 hidden h-[2px] origin-left bg-accent lg:block" aria-hidden="true" />
          {/* mobile vertical connector */}
          <span className="absolute bottom-6 left-7 top-6 w-[2px] bg-line lg:hidden" aria-hidden="true" />
          <span data-flow-fill className="absolute bottom-6 left-7 top-6 w-[2px] origin-top bg-accent lg:hidden" aria-hidden="true" />

          <ol className="relative grid gap-6 lg:grid-cols-6 lg:gap-4">
            {analyticsSteps.map((s, i) => {
              const Icon = icons[i]
              return (
                <li key={s.title} data-flow-step className="group flex gap-5 lg:flex-col lg:items-center lg:gap-4 lg:text-center">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-ink shadow-[var(--shadow-card)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:text-accent">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="pt-1 lg:pt-0">
                    <p className="font-mono text-[0.68rem] text-accent">STEP {String(i + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1 font-semibold leading-snug text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-3">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-2.5" data-reveal="stagger">
          <span className="eyebrow mr-2">Toolkit</span>
          {analyticsTools.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
