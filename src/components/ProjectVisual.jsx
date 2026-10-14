/**
 * Abstract, illustrative thumbnails for projects (no real data, no numbers).
 * Swap for real screenshots by adding `image` to a project and rendering an <img>.
 */
const bar = 'rounded-md bg-ink/10'

function Window({ children, tint = '#e9eefd' }) {
  return (
    <div className="absolute inset-0 p-5">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#f2b8b5]" />
          <span className="h-2 w-2 rounded-full bg-[#f4d9a6]" />
          <span className="h-2 w-2 rounded-full bg-[#b9dfc9]" />
          <span className="ml-3 h-2 w-24 rounded-full" style={{ background: tint }} />
        </div>
        <div className="relative flex-1 p-4">{children}</div>
      </div>
    </div>
  )
}

const visuals = {
  hrms: () => (
    <Window>
      <div className="flex h-full gap-3">
        <div className="w-1/4 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-2.5 ${i === 1 ? 'rounded-md bg-accent/70' : bar}`} />
          ))}
        </div>
        <div className="flex-1 space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-line p-2">
              <span className="h-5 w-5 rounded-full bg-accent-soft" />
              <span className={`h-2 flex-1 ${bar}`} />
              <span className={`h-4 w-10 rounded-full ${i % 2 ? 'bg-mint/20' : 'bg-amber/20'}`} />
            </div>
          ))}
        </div>
      </div>
    </Window>
  ),
  analyst: () => (
    <Window>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-accent/40 bg-accent-soft/50 p-2.5">
          <span className="h-5 w-4 rounded-sm bg-accent/60" />
          <span className={`h-2 w-1/3 ${bar}`} />
        </div>
        <div className="flex flex-1 items-end gap-1.5">
          {[38, 62, 45, 80, 56, 70, 90].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-md bg-accent/70" style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }} />
          ))}
        </div>
        <div className="rounded-lg bg-mist p-2">
          <span className={`block h-2 w-3/4 ${bar}`} />
        </div>
      </div>
    </Window>
  ),
  attrition: () => (
    <Window tint="#e7f4ee">
      <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden="true">
        {Array.from({ length: 34 }).map((_, i) => {
          const x = 12 + ((i * 37) % 176)
          const y = 14 + ((i * 53) % 84)
          const hi = x + y * 0.9 > 150
          return <circle key={i} cx={x} cy={y} r="3.6" fill={hi ? '#2f5bea' : '#15936b'} opacity={hi ? 0.75 : 0.45} />
        })}
        <path d="M30 104 C 80 60, 110 70, 190 10" stroke="#0e1a2b" strokeWidth="1.6" fill="none" strokeDasharray="4 4" opacity=".55" />
      </svg>
    </Window>
  ),
  dashboard: () => (
    <Window tint="#fbf0dc">
      <div className="grid h-full grid-cols-3 grid-rows-[auto_1fr] gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-line p-2">
            <span className={`block h-1.5 w-2/3 ${bar}`} />
            <span className="mt-1.5 block h-3 w-1/2 rounded bg-ink/70" />
          </div>
        ))}
        <div className="col-span-2 rounded-lg border border-line p-2">
          <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 32 L15 26 L30 28 L45 18 L60 21 L75 10 L100 6" fill="none" stroke="#2f5bea" strokeWidth="2" />
            <path d="M0 32 L15 26 L30 28 L45 18 L60 21 L75 10 L100 6 L100 40 L0 40Z" fill="#2f5bea" opacity=".08" />
          </svg>
        </div>
        <div className="grid place-items-center rounded-lg border border-line">
          <div className="h-12 w-12 rounded-full" style={{ background: 'conic-gradient(#2f5bea 0 45%, #b7791f 45% 70%, #e2e6ec 70%)' }}>
            <div className="m-[9px] h-[30px] w-[30px] rounded-full bg-surface" />
          </div>
        </div>
      </div>
    </Window>
  ),
  crud: () => (
    <Window>
      <div className="flex h-full flex-col gap-2">
        <div className="flex gap-2">
          <span className="h-6 flex-1 rounded-md border border-line" />
          <span className="h-6 w-14 rounded-md bg-ink" />
        </div>
        {['C', 'R', 'U', 'D'].map((k, i) => (
          <div key={k} className="flex items-center gap-2 rounded-md bg-mist px-2 py-1.5">
            <span className="grid h-5 w-5 place-items-center rounded font-mono text-[10px] font-bold text-white" style={{ background: ['#15936b', '#2f5bea', '#b7791f', '#c2410c'][i] }}>
              {k}
            </span>
            <span className={`h-2 flex-1 ${bar}`} />
          </div>
        ))}
      </div>
    </Window>
  ),
}

export default function ProjectVisual({ kind }) {
  const V = visuals[kind] ?? visuals.crud
  return (
    <div className="relative h-full w-full bg-[radial-gradient(120%_90%_at_80%_0%,#e9eefd_0%,#f1f3f6_55%,#eef1f5_100%)]">
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <V />
      </div>
    </div>
  )
}
