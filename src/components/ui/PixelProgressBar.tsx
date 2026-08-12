interface PixelProgressBarProps {
  value: number
  max?: number
  label?: string
  showText?: boolean
  className?: string
}

export function PixelProgressBar({
  value,
  max = 100,
  label,
  showText = true,
  className = '',
}: PixelProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      {(label || showText) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label ? <span className="hud-label">{label}</span> : <span />}
          {showText ? (
            <span className="font-pixel text-[8px] text-[var(--text-secondary)]">
              {value} / {max}
            </span>
          ) : null}
        </div>
      )}
      <div
        className="pixel-progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="pixel-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
