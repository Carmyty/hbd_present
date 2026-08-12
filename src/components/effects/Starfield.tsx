import { useMemo } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function Starfield({ density = 60 }: { density?: number }) {
  const reduced = useReducedMotion()
  const stars = useMemo(
    () =>
      Array.from({ length: density }, (_, i) => ({
        id: i,
        left: `${(i * 47) % 100}%`,
        top: `${(i * 29) % 100}%`,
        size: (i % 3) + 1,
        delay: `${(i % 8) * 0.35}s`,
        opacity: 0.25 + (i % 5) * 0.12,
      })),
    [density],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((star) => (
        <span
          key={star.id}
          className={reduced ? '' : 'blink'}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: '#D7D5C8',
            opacity: star.opacity,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  )
}
