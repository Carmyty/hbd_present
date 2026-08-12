import type { ReactNode } from 'react'

export function PixelBadge({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={`pixel-badge ${className}`}>{children}</span>
}
