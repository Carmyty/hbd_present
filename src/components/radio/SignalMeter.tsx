export function SignalMeter({
  strength,
  locked = false,
}: {
  strength: number
  locked?: boolean
}) {
  const level = Math.max(0, Math.min(5, Math.round(strength)))

  return (
    <div
      className="flex items-end gap-1"
      aria-label={locked ? 'Signal locked' : `Signal strength ${level} of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="w-2"
          style={{
            height: 8 + i * 4,
            background: locked
              ? i < level
                ? 'var(--highlight)'
                : 'var(--panel-light)'
              : i < level
                ? 'var(--success)'
                : 'var(--panel-light)',
            border: '1px solid var(--pixel-border)',
            opacity: locked && i >= level ? 0.45 : 1,
          }}
        />
      ))}
    </div>
  )
}
