import { useRef } from 'react'
import { Monitor, Server, Database, ShieldCheck, ChartColumn } from 'lucide-react'
import { gsap, useGSAP, useReveal, MOTION_OK, useFinePointer } from '../hooks/useGSAPAnimations.js'

/**
 * A lightweight 3D "system map" built with CSS 3D transforms (no second WebGL
 * context, so it costs almost nothing). The plane starts tilted in perspective
 * and settles flat as you scroll; on desktop it also tilts toward the pointer.
 * Animated dashed connectors show requests flowing between layers.
 */
const nodes = [
  { id: 'client', icon: Monitor, title: 'Client', items: ['React', 'JavaScript', 'Tailwind CSS'], pos: 'lg:col-start-1 lg:row-start-1', z: 60 },
  { id: 'api', icon: Server, title: 'API layer', items: ['Django', 'FastAPI', 'Node · Express', 'REST'], pos: 'lg:col-start-2 lg:row-start-1', z: 90 },
  { id: 'data', icon: Database, title: 'Database', items: ['MySQL', 'PostgreSQL'], pos: 'lg:col-start-3 lg:row-start-1', z: 60 },
  { id: 'qa', icon: ShieldCheck, title: 'Quality', items: ['Test cases', 'API tests · Postman', 'Regression'], pos: 'lg:col-start-1 lg:col-span-1 lg:row-start-2', z: 30 },
  { id: 'insight', icon: ChartColumn, title: 'Insights', items: ['Python · Pandas', 'Excel', 'Power BI'], pos: 'lg:col-start-3 lg:row-start-2', z: 30 },
]

export default function ImmersiveTech() {
  const scope = useRef(null)
  const plane = useRef(null)
  const fine = useFinePointer()
  useReveal(scope)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        gsap.fromTo(
          plane.current,
          { rotateX: 32, rotateZ: -6, y: 60 },
          { rotateX: 8, rotateZ: 0, y: 0, ease: 'none', scrollTrigger: { trigger: scope.current, start: 'top 85%', end: 'center 55%', scrub: 0.8 } },
        )
        gsap.utils.toArray('[data-node]').forEach((el) => {
          gsap.fromTo(
            el,
            { z: 0 },
            { z: Number(el.dataset.z), ease: 'none', scrollTrigger: { trigger: scope.current, start: 'top 75%', end: 'center 55%', scrub: 0.8 } },
          )
        })
      })
      if (fine) {
        mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
          const wrap = scope.current.querySelector('[data-tilt]')
          const ry = gsap.quickTo(wrap, 'rotateY', { duration: 0.9, ease: 'power3' })
          const rx = gsap.quickTo(wrap, 'rotateX', { duration: 0.9, ease: 'power3' })
          const onMove = (e) => {
            const r = wrap.getBoundingClientRect()
            ry(((e.clientX - r.left) / r.width - 0.5) * 8)
            rx(-((e.clientY - r.top) / r.height - 0.5) * 6)
          }
          const reset = () => {
            ry(0)
            rx(0)
          }
          wrap.addEventListener('pointermove', onMove)
          wrap.addEventListener('pointerleave', reset)
          return () => {
            wrap.removeEventListener('pointermove', onMove)
            wrap.removeEventListener('pointerleave', reset)
          }
        })
      }
      return () => mm.revert()
    },
    { scope, dependencies: [fine] },
  )

  return (
    <section ref={scope} aria-labelledby="stack-title" className="relative overflow-hidden section-y">
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow" data-reveal>
            How it fits together
          </p>
          <h2 id="stack-title" className="display mt-5 text-[2.2rem] text-ink sm:text-5xl">
            <span data-reveal-words>One developer,</span>{' '}
            <span className="serif-accent text-accent" data-reveal-words>
              the whole system.
            </span>
          </h2>
          <p className="mt-5 text-ink-2" data-reveal>
            The technologies I work with, mapped to where they sit in a typical application — from the screen to the database, with quality and
            insight wrapped around it.
          </p>
        </div>

        <div data-tilt className="mx-auto mt-16 max-w-5xl [perspective:1400px]" style={{ transformStyle: 'preserve-3d' }}>
          <div ref={plane} className="relative rounded-[2rem] border border-line bg-surface/70 p-5 shadow-[var(--shadow-lift)] backdrop-blur sm:p-8" style={{ transformStyle: 'preserve-3d' }}>
            {/* connectors (desktop) */}
            <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
              <g fill="none" stroke="#2f5bea" strokeWidth="2" strokeDasharray="6 8" className="motion-safe:animate-[dash_1.6s_linear_infinite]" opacity=".55">
                <path d="M300 140 H 370" vectorEffect="non-scaling-stroke" />
                <path d="M630 140 H 700" vectorEffect="non-scaling-stroke" />
                <path d="M500 250 V 330 H 330" vectorEffect="non-scaling-stroke" />
                <path d="M500 250 V 330 H 670" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>

            <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:gap-x-[7%] lg:gap-y-16" style={{ transformStyle: 'preserve-3d' }}>
              {nodes.map(({ id, icon: Icon, title, items, pos, z }) => (
                <li
                  key={id}
                  data-node
                  data-z={z}
                  className={`${pos} group rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-300 hover:border-accent/35 hover:shadow-[var(--shadow-lift)]`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold text-ink">{title}</h3>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {items.map((t) => (
                      <li key={t} className="rounded-md bg-mist px-2 py-1 font-mono text-[0.72rem] text-ink-2">
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {/* centre badge in row 2 */}
              <li className="hidden items-center justify-center lg:col-start-2 lg:row-start-2 lg:flex" aria-hidden="true">
                <span className="rounded-full border border-dashed border-accent/40 bg-accent-soft/60 px-5 py-2.5 font-mono text-xs text-accent-deep">
                  build · test · analyse
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
