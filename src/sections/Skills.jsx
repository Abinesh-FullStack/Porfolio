import { useRef } from 'react'
import SectionHeading from '../components/SectionHeading.jsx'
import { ICONS } from '../components/SkillCard.jsx'
import { skillGroups } from '../data/skills.js'
import { useReveal } from '../hooks/useGSAPAnimations.js'

/**
 * Skills as one organised panel: each category is a row (name + short
 * description on the left, technology badges on the right). No ratings.
 * Edit src/data/skills.js to add or change technologies.
 */
export default function Skills() {
  const scope = useRef(null)
  useReveal(scope)
  const total = skillGroups.reduce((n, g) => n + g.items.length, 0)

  return (
    <section id="skills" ref={scope} aria-labelledby="skills-title" className="relative bg-mist section-y">
      <div className="container-x">
        <SectionHeading
          id="skills-title"
          index="02"
          eyebrow="Skills"
          title="A toolkit across the"
          accent="whole lifecycle."
          aside={
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
              {skillGroups.length} areas · {total} technologies
            </p>
          }
        >
          From the interface to the database, from test cases to dashboards — grouped by how I use them.
        </SectionHeading>

        <div className="card mt-12 overflow-hidden">
          <ul className="divide-y divide-line" data-reveal="stagger">
            {skillGroups.map((g, i) => {
              const Icon = ICONS[g.icon]
              return (
                <li key={g.id} className="group grid gap-4 px-5 py-6 transition-colors duration-300 hover:bg-paper/70 sm:px-8 md:grid-cols-[17rem_1fr] md:items-center md:gap-10">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mist text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-paper">
                      {Icon && <Icon size={20} aria-hidden="true" />}
                    </span>
                    <div>
                      <h3 className="font-semibold tracking-tight text-ink">
                        <span className="mr-2 font-mono text-[0.7rem] font-normal text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                        {g.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-3">{g.blurb}</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2 md:justify-start" aria-label={`${g.title} technologies`}>
                    {g.items.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
