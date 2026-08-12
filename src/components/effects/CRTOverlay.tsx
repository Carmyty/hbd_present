export function CRTOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
        mixBlendMode: 'multiply',
      }}
    />
  )
}
