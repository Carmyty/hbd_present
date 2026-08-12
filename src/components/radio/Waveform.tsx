export function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 16 }, (_, i) => i)

  return (
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {bars.map((i) => (
        <span
          key={i}
          className={`w-1.5 origin-bottom bg-[var(--accent)] ${active ? 'anim-wave' : ''}`}
          style={{
            height: `${30 + ((i * 17) % 70)}%`,
            animationDelay: `${i * 0.05}s`,
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  )
}
