import { useRef } from 'react'
import { Award, Briefcase, CalendarDays } from 'lucide-react'
import { gsap, useGSAP, MOTION_OK } from '../hooks/useGSAPAnimations.js'

/**
 * Vertical timeline for one company. The accent line fills as you scroll
 * (scrubbed), and each node "lights up" as the line reaches it.
 */
export default function ExperienceTimeline({ job }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-line-fill]',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-line]', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } },
        )
        gsap.utils.toArray('[data-phase]').forEach((el) => {
          const dot = el.querySelector('[data-dot]')
          gsap.from(el.querySelector('[data-phase-card]'), {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          })
          gsap.fromTo(
            dot,
            { scale: 0.6, backgroundColor: '#e2e6ec' },
            {
              scale: 1,
              backgroundColor: '#2f5bea',
              duration: 0.4,
              scrollTrigger: { trigger: el, start: 'top 62%', toggleActions: 'play none none reverse' },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative">
      {/* company header */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7" data-reveal>
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-paper">
            <Briefcase size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">{job.role}</h3>
            <p className="text-ink-2">{job.company}</p>
          </div>
        </div>
        <p className="flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-ink-2">
          <CalendarDays size={15} aria-hidden="true" />
          {job.start} — {job.end}
          {job.current && <span className="ml-1 rounded-full bg-mint/10 px-2 py-0.5 text-xs font-medium text-mint">Current</span>}
        </p>
      </div>

      <ol className="relative mt-10 pl-10 sm:pl-16" data-line>
        {/* track + animated fill */}
        <span className="absolute bottom-4 left-[11px] top-2 w-[2px] rounded bg-line sm:left-[19px]" aria-hidden="true" />
        <span data-line-fill className="absolute bottom-4 left-[11px] top-2 w-[2px] origin-top rounded bg-accent sm:left-[19px]" aria-hidden="true" />

        {job.phases.map((p) => (
          <li key={p.year} data-phase className="relative pb-12 last:pb-0">
            <span
              data-dot
              className="absolute -left-10 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent ring-[6px] ring-paper sm:-left-16 sm:ml-2"
              aria-hidden="true"
            >
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>

            <div data-phase-card className="grid gap-6 lg:grid-cols-[9rem_1fr]">
              <div>
                <p className="display text-4xl text-ink lg:text-5xl">{p.year}</p>
              </div>
              <article className="card p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold tracking-tight text-ink">{p.title}</h4>
                  {p.award && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-xs font-medium text-amber">
                      <Award size={14} aria-hidden="true" />
                      {p.award}
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[0.98rem] leading-relaxed text-ink-2">
                      <span className="mt-[0.62rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5" aria-label="Technologies">
                  {p.tech.map((t) => (
                    <li key={t} className="chip !py-1 !text-xs">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
