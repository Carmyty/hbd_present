import type { ReactNode } from 'react'
import { PixelButton } from '../ui/PixelButton'
import { PixelWindow } from '../ui/PixelWindow'
import { useAudio } from '../../hooks/useAudio'

export function GameContainer({
  title,
  onExit,
  children,
}: {
  title: string
  onExit: () => void
  children: ReactNode
}) {
  const { playUISound } = useAudio()

  return (
    <PixelWindow
      title={title}
      actions={
        <PixelButton
          variant="ghost"
          className="!py-2 !text-[8px]"
          sfx={false}
          onClick={() => {
            playUISound('back')
            onExit()
          }}
        >
          EXIT
        </PixelButton>
      }
    >
      {children}
    </PixelWindow>
  )
}
