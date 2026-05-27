import { X } from 'lucide-react'

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'center',
}) => {
  if (!isOpen) return null

  const overlayBase =
    'fixed inset-0 z-[160] flex bg-black/80 backdrop-blur-sm animate-fade-in'
  const overlayPosition =
    variant === 'drawer'
      ? 'justify-end'
      : 'items-center justify-center p-4'

  const modalBase =
    'bg-surface-container border border-outline-variant/15 shadow-2xl relative flex flex-col justify-between'
  const modalShape =
    variant === 'drawer'
      ? 'w-full max-w-md h-full p-6 md:p-8 border-l'
      : 'w-full max-w-lg rounded-3xl p-6 md:p-8 max-h-[90vh]'

  return (
    <div className={`${overlayBase} ${overlayPosition}`}>
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className={`${modalBase} ${modalShape} z-10 animate-fade-in`}>
        <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1 scrollbar-thin select-none">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <div>
              <h3 className="font-headline font-black text-glow text-primary text-lg uppercase tracking-wider flex items-center gap-1.5">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-surface-container-high transition-colors active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
