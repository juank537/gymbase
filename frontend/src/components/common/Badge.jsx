export const Badge = ({
  variant = 'primary',
  label,
  className = '',
  uppercase = true,
}) => {
  const baseStyles =
    'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest leading-none inline-block font-sans shrink-0'

  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-[#ece856]/15 text-[#ece856]',
    success:
      'bg-emerald-500/10 text-emerald-400 border border-emerald-950/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-950/20',
    warning:
      'bg-amber-500/10 text-amber-400 border border-amber-950/20',
    neutral: 'bg-surface-container-highest text-on-surface-variant',
    purple:
      'bg-purple-500/10 text-purple-400 border border-purple-950/20',
    amber: 'bg-amber-400/10 text-amber-400',
  }

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${uppercase ? 'uppercase' : ''} ${className}`}
    >
      {label}
    </span>
  )
}
