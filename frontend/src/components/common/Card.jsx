export const Card = ({
  children,
  variant = 'default',
  glow = false,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden'

  const variants = {
    default: 'bg-surface-container border-outline-variant/10',
    high: 'bg-surface-container-high border-outline-variant/15',
    low: 'bg-surface-container-low border-outline-variant/10',
    super: 'bg-[#1a1a1a] border-outline-variant/10',
    interactive:
      'bg-surface-container-high hover:bg-surface-variant cursor-pointer border-outline-variant/5',
  }

  const glowStyle = glow
    ? 'shadow-[0_0_24px_rgba(243,255,202,0.06)] ring-1 ring-primary/10'
    : ''

  const hoverStyle = hoverEffect
    ? 'hover:-translate-y-1 hover:border-outline-variant/30 hover:shadow-lg duration-300'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${glowStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {glow && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      )}
      {children}
    </div>
  )
}
