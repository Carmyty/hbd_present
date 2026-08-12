export function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.12] anim-scan"
      aria-hidden
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(215,213,200,0.15) 0, rgba(215,213,200,0.15) 1px, transparent 1px, transparent 3px)',
      }}
    />
  )
}
