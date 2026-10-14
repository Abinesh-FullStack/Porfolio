import { useRef, useState } from 'react'
import { Code2, ShieldCheck, ChartLine, Sparkles, UserRound } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import { useReveal } from '../hooks/useGSAPAnimations.js'
import { asset, profile } from '../data/profile.js'

const focus = [
  { icon: Code2, title: 'Full Stack Development', text: 'Frontend, backend and APIs' },
  { icon: ShieldCheck, title: 'Automation Testing', text: 'Manual, functional & automated' },
  { icon: ChartLine, title: 'Data Analytics', text: 'Cleaning, analysis, dashboards' },
  { icon: Sparkles, title: 'Continuous Learning', text: 'Exploring AI & machine learning' },
]

function Portrait() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-line bg-mist shadow-[var(--shadow-lift)]">
      {!failed ? (
        <img
          src={asset(profile.photo)}
          alt={`Portrait of ${profile.name}`}
          width="800"
          height="1000"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          data-parallax="0.06"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[linear-gradient(160deg,#f1f3f6,#e6ebf3)] p-8 text-center">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-surface text-ink-3 shadow-[var(--shadow-card)]">
            <UserRound size={40} strokeWidth={1.4} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-ink-2">Photo coming soon</p>
          {import.meta.env.DEV && (
            <p className="max-w-[16rem] font-mono text-[0.7rem] leading-relaxed text-ink-3">
              Add your photo at <br />public/images/abinesh-profile.jpg
            </p>
          )}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/75 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold text-ink">{profile.name}</p>
          <p className="text-xs text-ink-3">{profile.role}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-ink-2">
          <span className="status-dot h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
          {profile.company.replace(' Pvt Ltd', '')}
        </span>
      </div>
    </div>
  )
}

export default function About() {
  const scope = useRef(null)
  useReveal(scope)

  return (
    <section id="about" ref={scope} aria-labelledby="about-title" className="relative section-y">
      <div className="container-x grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="mx-auto w-full max-w-[26rem] lg:sticky lg:top-24 lg:self-start" data-reveal>
          <Portrait />
        </div>

        <div>
          <SectionHeading id="about-title" index="01" eyebrow="About me" title="Developer, tester and" accent="data-curious problem solver." />

          <div className="mt-10 space-y-5 text-[1.1rem] leading-[1.75] text-ink-2" data-reveal="stagger">
            <p>
              <span className="font-semibold text-ink">I’m {profile.name}</span>, a Full Stack Developer with around two years of experience building web
              applications, working with backend systems and APIs, testing application quality, and analysing data to generate useful insights.
            </p>
            <p>
              I enjoy solving practical business problems through software development, automation and data-driven solutions — the kind of work
              where a well-built screen, a reliable test suite and a clear dashboard all matter equally.
            </p>
            <p>
              My professional interests include full stack engineering, software quality assurance, automation testing, business intelligence and
              AI-powered applications.
            </p>
          </div>

          {/* summary card */}
          <div className="card mt-12 overflow-hidden" data-reveal>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <p className="eyebrow">Professional summary</p>
              <p className="text-sm text-ink-2">
                <span className="font-semibold text-ink">{profile.role}</span> · {profile.company}
              </p>
            </div>
            <ul className="grid sm:grid-cols-2">
              {focus.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  className={`group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-mist ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 2 ? 'border-b' : 'max-sm:border-b max-sm:last:border-b-0'} border-line`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-sm text-ink-3">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
