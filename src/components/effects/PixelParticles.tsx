import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function PixelParticles({ count = 12 }: { count?: number }) {
  const reduced = useReducedMotion()
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: `${10 + ((i * 17) % 80)}%`,
        color: i % 2 === 0 ? '#D3A84A' : '#768F62',
        delay: i * 0.15,
      })),
    [count],
  )

  if (reduced) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-1 w-1"
          style={{ left: p.x, bottom: '10%', background: p.color }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -80 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
