export const Input = ({
  label = '',
  error = '',
  fullWidth = true,
  className = '',
  type = 'text',
  ...props
}) => {
  const widthStyle = fullWidth ? 'w-full' : ''
  const errorRing = error
    ? 'ring-1 ring-red-500/50 border-red-500/50'
    : ''

  return (
    <div className={`space-y-1.5 ${widthStyle}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/40 focus:outline-none text-on-surface placeholder-on-surface-variant/40 transition-all ${widthStyle} ${errorRing} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-medium text-red-400">{error}</p>
      )}
    </div>
  )
}

export const Select = ({
  label = '',
  error = '',
  fullWidth = true,
  className = '',
  options = [],
  ...props
}) => {
  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <div className={`space-y-1.5 ${widthStyle}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
          {label}
        </label>
      )}
      <select
        className={`bg-surface-container-low border border-outline-variant/15 text-xs rounded-xl px-4 py-3 text-on-surface uppercase font-bold tracking-wider focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all ${widthStyle} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-surface-container"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] font-medium text-red-400">{error}</p>
      )}
    </div>
  )
}
