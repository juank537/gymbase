export const Button = ({
  children = null,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'font-headline font-semibold transition-all duration-200 uppercase tracking-wider inline-flex items-center justify-center gap-2 active:scale-95 disabled:opacity-55 disabled:pointer-events-none'

  const variants = {
    primary:
      'bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/10 hover:shadow-primary/20',
    secondary:
      'bg-surface-container-highest/50 backdrop-blur-md text-on-surface border border-outline-variant/10 hover:bg-surface-container-highest',
    danger:
      'bg-red-950/40 text-red-400 border border-red-800/25 hover:bg-red-900/30',
    ghost:
      'text-on-surface-variant hover:text-white hover:bg-surface-container-high/50',
    amber:
      'bg-amber-400 text-black hover:opacity-90 shadow-lg shadow-amber-400/20',
    purple:
      'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/25 hover:shadow-lg hover:shadow-purple-900/10',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[10px] rounded-lg',
    md: 'px-6 py-3 text-xs rounded-full',
    lg: 'px-8 py-4 text-sm rounded-full',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
