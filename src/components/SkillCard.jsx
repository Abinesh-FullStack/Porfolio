import { Code2, Server, Database, ChartColumn, ShieldCheck, Wrench } from 'lucide-react'

export const ICONS = { code: Code2, server: Server, database: Database, chart: ChartColumn, shield: ShieldCheck, wrench: Wrench }

/** One skill category: icon, title, blurb and technology badges. No ratings by design. */
export default function SkillCard({ group, index }) {
  const Icon = ICONS[group.icon] ?? Code2
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-accent/25 hover:shadow-[var(--shadow-lift)] sm:p-7">
      {/* animated top indicator */}
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" aria-hidden="true" />
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
          <Icon size={22} aria-hidden="true" />
        </span>
        <span className="font-mono text-xs text-ink-3">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{group.title}</h3>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-3">{group.blurb}</p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${group.title} skills`}>
        {group.items.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
    </article>
  )
}
