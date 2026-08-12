import type { ReactNode } from 'react'

export function PixelFlicker({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`pixel-flicker ${className}`}>{children}</div>
}
