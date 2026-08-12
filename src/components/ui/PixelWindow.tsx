import type { ReactNode } from 'react'
import { PixelPanel } from './PixelPanel'

interface PixelWindowProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function PixelWindow({
  title,
  children,
  actions,
  className = '',
}: PixelWindowProps) {
  return (
    <PixelPanel className={`overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--pixel-border)] bg-[var(--panel-mid)] px-3 py-2">
        <h2 className="pixel-window-title">{title}</h2>
        {actions}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </PixelPanel>
  )
}
