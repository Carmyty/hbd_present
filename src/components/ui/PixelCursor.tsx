export function PixelCursor({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-[1em] w-[0.55em] translate-y-[0.1em] bg-[var(--accent)] blink ${className}`}
      aria-hidden
    />
  )
}
