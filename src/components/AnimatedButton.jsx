import { ArrowRight } from 'lucide-react'

/**
 * Pill button/link with a sliding arrow micro-interaction.
 * variant: 'primary' | 'secondary' | 'ghost'
 * Renders <a> when `href` is given, otherwise <button>.
 */
export default function AnimatedButton({ href, children, variant = 'primary', icon: Icon = ArrowRight, external, className = '', ...rest }) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-[0.95rem] font-medium transition-[background,color,box-shadow,transform,border-color] duration-300 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55'
  const styles = {
    primary: 'bg-ink text-paper shadow-[0_10px_30px_-12px_rgb(14_26_43/0.55)] hover:bg-accent-deep hover:shadow-[0_14px_34px_-12px_rgb(47_91_234/0.6)]',
    secondary: 'border border-line bg-surface text-ink hover:border-ink/25 hover:shadow-[var(--shadow-card)]',
    ghost: 'text-ink hover:text-accent-deep px-2',
  }
  const content = (
    <>
      <span>{children}</span>
      {Icon && (
        <span className="relative inline-flex h-4 w-4 overflow-hidden" aria-hidden="true">
          <Icon size={16} className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-5" />
          <Icon size={16} className="absolute inset-0 -translate-x-5 transition-transform duration-300 ease-out group-hover:translate-x-0" />
        </span>
      )}
    </>
  )
  const cls = `${base} ${styles[variant]} ${className}`
  if (href) {
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button className={cls} {...rest}>
      {content}
    </button>
  )
}
