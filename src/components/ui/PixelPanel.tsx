import type { HTMLAttributes, ReactNode } from 'react'

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: 'default' | 'mid' | 'light'
}

const toneClass = {
  default: 'pixel-panel',
  mid: 'pixel-panel pixel-panel-mid',
  light: 'pixel-panel pixel-panel-light',
}

export function PixelPanel({
  children,
  tone = 'default',
  className = '',
  ...rest
}: PixelPanelProps) {
  return (
    <div className={`pixel-border ${toneClass[tone]} ${className}`} {...rest}>
      {children}
    </div>
  )
}
