import { ArrowUp } from 'lucide-react'
import { LinkedInIcon, GitHubIcon } from './BrandIcons.jsx'
import { navLinks, profile } from '../data/profile.js'

export default function Footer() {
  const year = new Date().getFullYear()
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <a href="#home" className="text-2xl font-bold tracking-tight text-ink">
              ABINESH V<span className="text-accent">.</span>
            </a>
            <p className="mt-2 text-sm text-ink-3">{profile.positioning}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-4">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="link-underline text-sm text-ink-2 transition-colors hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-3">
            © {year} {profile.name}. Built with React, Three.js & GSAP.
          </p>
          <div className="flex items-center gap-2">
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in new tab)" className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition hover:-translate-y-0.5 hover:border-ink/20 hover:text-accent-deep">
              <LinkedInIcon size={16} />
            </a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in new tab)" className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition hover:-translate-y-0.5 hover:border-ink/20 hover:text-accent-deep">
              <GitHubIcon size={16} />
            </a>
            <button
              type="button"
              onClick={toTop}
              className="group ml-2 inline-flex items-center gap-2 rounded-full bg-ink py-2.5 pl-4 pr-3 text-sm font-medium text-paper transition hover:bg-accent-deep"
            >
              Back to top
              <span className="relative inline-flex h-4 w-4 overflow-hidden" aria-hidden="true">
                <ArrowUp size={16} className="absolute inset-0 transition-transform duration-300 group-hover:-translate-y-5" />
                <ArrowUp size={16} className="absolute inset-0 translate-y-5 transition-transform duration-300 group-hover:translate-y-0" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
