import { ArrowUpRight, Lock, FlaskConical } from 'lucide-react'
import ProjectVisual from './ProjectVisual.jsx'
import { statusLabels } from '../data/projects.js'

const statusStyle = {
  professional: 'bg-ink text-paper',
  completed: 'bg-[#e7f4ee] text-mint border border-mint/20',
  'in-progress': 'bg-accent-soft text-accent-deep border border-accent/20',
  learning: 'bg-[#fbf2e3] text-amber border border-amber/25',
}

export default function ProjectCard({ project, index, compact = false }) {
  const { title, category, description, tech, url, status, note, visual } = project
  return (
    <article className="card group flex h-full w-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-[var(--shadow-lift)]">
      <div className={`relative ${compact ? 'aspect-[16/8]' : 'aspect-[16/10]'} overflow-hidden border-b border-line`}>
        <ProjectVisual kind={visual} />
        <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[status]}`}>
          {status === 'learning' && <FlaskConical size={12} aria-hidden="true" />}
          {statusLabels[status]}
        </span>
        <span className="absolute right-4 top-4 font-mono text-xs text-ink-3">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? 'p-6' : 'p-6 sm:p-7'}`}>
        <p className="eyebrow !text-[0.66rem] text-accent">{category}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h3>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{description}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
          {tech.map((t) => (
            <li key={t} className="rounded-md bg-mist px-2 py-1 font-mono text-[0.7rem] text-ink-2">
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-accent-deep"
            >
              <span className="link-underline">View Project</span>
              <ArrowUpRight size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-3">
              <Lock size={14} aria-hidden="true" />
              {note ?? 'Preview only — link coming soon'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
