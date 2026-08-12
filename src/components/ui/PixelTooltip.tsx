import type { ReactNode } from 'react'

export function PixelTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap border-2 border-[var(--pixel-border)] bg-[var(--panel-light)] px-2 py-1 font-pixel text-[8px] text-[var(--highlight)] group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  )
}
