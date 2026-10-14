import { useRef } from 'react'
import { Check, FlaskConical } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import { testingSteps, testingAreas } from '../data/workflows.js'
import { gsap, useGSAP, useReveal, MOTION_OK } from '../hooks/useGSAPAnimations.js'

/**
 * Left: the testing lifecycle as a "pipeline run" — each stage ticks to passed
 * as you scroll. Right: the testing areas I work in.
 */
export default function Automation() {
  const scope = useRef(null)
  useReveal(scope)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const rows = gsap.utils.toArray('[data-test-row]')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '[data-pipeline]', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
        })
        tl.fromTo('[data-pipe-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: rows.length }, 0)
        rows.forEach((row, i) => {
          tl.fromTo(row.querySelector('[data-tick]'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2)' }, i + 0.5)
          tl.fromTo(row.querySelector('[data-pass]'), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.3 }, i + 0.55)
          tl.fromTo(row, { color: '#66748a' }, { color: '#0e1a2b', duration: 0.3 }, i + 0.5)
        })
      })
      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section id="automation" ref={scope} aria-labelledby="automation-title" className="relative bg-mist section-y">
      <div className="container-x">
        <SectionHeading id="automation-title" index="06" eyebrow="Automation testing" title="Building Quality into" accent="Every Application.">
          As a developer who also tests, I think about how features can fail while I build them — and I verify them before users ever have to.
        </SectionHeading>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* pipeline */}
          <div className="card overflow-hidden" data-reveal>
            <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
              <p className="font-mono text-[0.78rem] text-ink-2">
                <span className="text-accent">$</span> test-lifecycle --run
              </p>
              <span className="font-mono text-[0.7rem] text-ink-3">{testingSteps.length} stages</span>
            </div>
            <ol data-pipeline className="relative px-6 py-6">
              <span className="absolute bottom-9 left-[2.15rem] top-9 w-[2px] bg-line" aria-hidden="true" />
              <span data-pipe-fill className="absolute bottom-9 left-[2.15rem] top-9 w-[2px] origin-top bg-mint" aria-hidden="true" />
              {testingSteps.map((s, i) => (
                <li key={s} data-test-row className="relative flex items-center gap-4 py-2.5 text-ink">
                  <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-surface">
                    <span data-tick className="grid h-6 w-6 place-items-center rounded-full bg-mint text-white">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                  </span>
                  <span className="font-mono text-[0.7rem] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-medium">{s}</span>
                  <span data-pass className="rounded-full bg-mint/10 px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider text-mint">
                    done
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* areas */}
          <div>
            <ul className="grid gap-4 sm:grid-cols-2" data-reveal="stagger">
              {testingAreas.map((a) => (
                <li
                  key={a.title}
                  className={`group rounded-2xl border p-5 transition-[transform,box-shadow,border-color] duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] ${
                    a.learning ? 'border-dashed border-amber/40 bg-amber/5' : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink">{a.title}</h3>
                    {a.learning && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2 py-0.5 text-[0.68rem] font-medium text-amber">
                        <FlaskConical size={11} aria-hidden="true" /> Learning
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">{a.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-l-2 border-accent pl-5 text-lg leading-relaxed text-ink-2" data-reveal>
              <span className="serif-accent text-2xl text-ink">Quality isn’t a phase at the end</span> — it starts with the requirements and carries through every test case and regression run.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
