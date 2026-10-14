import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/** Live `prefers-reduced-motion` value. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True for devices with a fine pointer that can hover (desktop mice/trackpads). */
export function useFinePointer() {
  const [fine, setFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const on = () => setFine(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return fine
}

/** Detect WebGL support once. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/**
 * Shared scroll-reveal system. Inside `scope`, any element with:
 *   data-reveal            → fades/slides up when it enters the viewport
 *   data-reveal="stagger"  → its direct children reveal one after another
 *   data-reveal-words      → its text splits into words that rise in sequence
 *   data-parallax="0.15"   → drifts vertically at that rate while scrolling
 * All tweens are created inside gsap.matchMedia, so they are skipped entirely
 * for reduced-motion users and reverted automatically on unmount via useGSAP.
 */
export function useReveal(scope, deps = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(scope)

        q('[data-reveal-words]').forEach((el) => {
          if (!el.dataset.split) {
            const words = el.textContent.trim().split(/\s+/)
            el.setAttribute('aria-label', el.textContent.trim())
            el.innerHTML = words
              .map((w) => `<span aria-hidden="true" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em"><span class="rw" style="display:inline-block">${w}</span></span>`)
              .join(' ')
            el.dataset.split = '1'
          }
          gsap.from(el.querySelectorAll('.rw'), {
            yPercent: 110,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        q('[data-reveal]').forEach((el) => {
          const isStagger = el.dataset.reveal === 'stagger'
          const targets = isStagger ? gsap.utils.toArray(el.children) : [el]
          // Many cards have CSS hover transitions on transform. If those stay
          // active, a ScrollTrigger refresh can read a mid-transition value and
          // freeze the card off-position, so disable them until the reveal ends.
          gsap.set(targets, { transition: 'none' })
          gsap.from(targets, {
            y: 36,
            autoAlpha: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: isStagger ? 0.08 : 0,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onComplete: () => gsap.set(targets, { clearProps: 'transition' }),
          })
        })

        q('[data-parallax]').forEach((el) => {
          const rate = parseFloat(el.dataset.parallax) || 0.15
          gsap.fromTo(
            el,
            { yPercent: -rate * 100 },
            {
              yPercent: rate * 100,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope, dependencies: deps },
  )
}

/** Active section tracking for the navbar. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}
