/**
 * Section header. On large screens the title sits left and the supporting copy
 * right (an editorial split that saves vertical space); on small screens they stack.
 * `aside` renders under the copy on the right (e.g. a counter or progress bar).
 */
export default function SectionHeading({ index, eyebrow, title, accent, children, align = 'left', id, aside, stacked = false }) {
  const center = align === 'center'
  const split = !center && !stacked && (children || aside)
  return (
    <header className={center ? 'mx-auto max-w-3xl text-center' : split ? 'grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16' : 'max-w-3xl'}>
      <div>
        <p className={`eyebrow flex items-center gap-3 ${center ? 'justify-center' : ''}`} data-reveal>
          {index && <span className="text-accent">{index}</span>}
          <span className="h-px w-8 bg-ink/15" aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
        <h2 id={id} className="display mt-5 text-[2.2rem] text-ink sm:text-[2.8rem] lg:text-[3.25rem]">
          <span data-reveal-words>{title}</span>
          {accent && (
            <>
              {' '}
              <span className="serif-accent text-accent" data-reveal-words>
                {accent}
              </span>
            </>
          )}
        </h2>
      </div>
      {(children || aside) && (
        <div className={split ? 'lg:pb-1.5' : 'mt-5'}>
          {children && (
            <p className={`max-w-xl text-[1.04rem] leading-relaxed text-ink-2 ${center ? 'mx-auto' : ''}`} data-reveal>
              {children}
            </p>
          )}
          {aside && (
            <div className="mt-4" data-reveal>
              {aside}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
