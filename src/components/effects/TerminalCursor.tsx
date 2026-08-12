import { PixelCursor } from '../ui/PixelCursor'

export function TerminalCursor({ className = '' }: { className?: string }) {
  return <PixelCursor className={className} />
}
