import { useRef } from 'react'
import SectionHeading from '../components/SectionHeading.jsx'
import ExperienceTimeline from '../components/ExperienceTimeline.jsx'
import { experience } from '../data/experience.js'
import { useReveal } from '../hooks/useGSAPAnimations.js'

export default function Experience() {
  const scope = useRef(null)
  useReveal(scope)

  return (
    <section id="experience" ref={scope} aria-labelledby="experience-title" className="relative section-y">
      <div className="container-x">
        <SectionHeading id="experience-title" index="03" eyebrow="Experience" title="Growing with every" accent="release.">
          Professional highlights from my time at Kenshin Systems — the products I’ve worked on and what I’ve learned along the way.
        </SectionHeading>

        <div className="mt-16 space-y-20">
          {experience.map((job) => (
            <ExperienceTimeline key={job.company + job.start} job={job} />
          ))}
        </div>
      </div>
    </section>
  )
}
