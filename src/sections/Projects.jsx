import { useEffect, useRef, useState } from 'react'
import SectionHeading from '../components/SectionHeading.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { projects } from '../data/projects.js'
import { profile } from '../data/profile.js'
import { gsap, ScrollTrigger, useGSAP, useReveal, MOTION_OK } from '../hooks/useGSAPAnimations.js'

/**
 * Desktop: a single pinned horizontal "story" — vertical scroll moves the
 * project track sideways. This is the only pinned section besides the hero.
 * Tablet, mobile and reduced-motion: a normal responsive grid.
 */
export default function Projects() {
  const scope = useRef(null)
  const pinRef = useRef(null)
  const track = useRef(null)
  useReveal(scope)

  // Horizontal mode only where it fits: desktop width, enough height, motion allowed.
  const QUERY = `(min-width: 1024px) and (min-height: 700px) and ${MOTION_OK}`
  const [horizontal, setHorizontal] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const on = () => setHorizontal(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [QUERY])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(QUERY, () => {
        const distance = () => track.current.scrollWidth - track.current.parentElement.clientWidth
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const bar = scope.current?.querySelector('[data-proj-bar]')
              if (bar) bar.style.transform = `scaleX(${self.progress})`
            },
          },
        })
        // cards tilt in as they enter from the right
        gsap.utils.toArray('[data-proj-card]').forEach((card) => {
          gsap.from(card, {
            rotateY: -12,
            z: -80,
            autoAlpha: 0.35,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 60%', scrub: true },
          })
        })
        // this pin is created after the sections below it — re-order and recalc
        ScrollTrigger.sort()
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      return () => mm.revert()
    },
    { scope, dependencies: [horizontal], revertOnUpdate: true },
  )

  return (
    <section id="projects" ref={scope} aria-labelledby="projects-title" className="relative bg-mist">
      <div ref={pinRef} className={horizontal ? 'flex h-screen flex-col justify-center pt-16' : 'section-y'}>
        <div className="container-x">
          <SectionHeading
            id="projects-title"
            index="04"
            eyebrow="Selected work"
            title="Projects that"
            accent="solve real problems."
            aside={
              horizontal ? (
                <div className="flex w-56 items-center gap-3" aria-hidden="true">
                  <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-fog">
                    <span data-proj-bar className="absolute inset-0 origin-left scale-x-0 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-xs text-ink-3">{String(projects.length).padStart(2, '0')} projects</span>
                </div>
              ) : null
            }
          >
            Professional work, analytics and learning projects — each labelled clearly so you know what it is.
          </SectionHeading>
        </div>

        <div className={`container-x ${horizontal ? 'mt-8' : 'mt-12'}`}>
          <div
            ref={track}
            className={horizontal ? 'flex w-max gap-6 [perspective:1200px]' : 'grid gap-5 md:grid-cols-2 lg:grid-cols-3'}
          >
            {projects.map((p, i) => (
              <div key={p.id} data-proj-card className={horizontal ? 'w-[24rem] shrink-0 xl:w-[26rem]' : ''}>
                <ProjectCard project={p} index={i} compact={horizontal} />
              </div>
            ))}
            <div className={`${horizontal ? 'flex' : 'hidden'} w-[22rem] shrink-0 flex-col justify-center rounded-[1.25rem] border border-dashed border-line p-8`}>
              <p className="eyebrow">More on GitHub</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">Personal experiments and code live on my GitHub profile.</p>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="mt-6 font-medium text-accent-deep">
                <span className="link-underline">Visit GitHub →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
