import type { GameMeta } from '../../types'
import { PixelBadge } from '../ui/PixelBadge'
import { PixelButton } from '../ui/PixelButton'
import { PixelPanel } from '../ui/PixelPanel'
import { useHoverSoundProps } from '../../hooks/useAudio'

export function GameCard({
  game,
  completed,
  highScore,
  onStart,
}: {
  game: GameMeta
  completed: boolean
  highScore?: number
  onStart: () => void
}) {
  const hoverProps = useHoverSoundProps(true)

  return (
    <PixelPanel
      className="flex h-full flex-col p-4"
      onMouseEnter={hoverProps.onMouseEnter}
    >
      <div className="mb-2 flex flex-wrap gap-2">
        <PixelBadge>{game.difficulty}</PixelBadge>
        {completed ? <PixelBadge>CLEARED</PixelBadge> : null}
      </div>
      <h3 className="font-pixel text-[10px] leading-relaxed text-[var(--highlight)]">
        {game.title}
      </h3>
      <p className="mt-2 flex-1 terminal-text text-base">{game.description}</p>
      {typeof highScore === 'number' ? (
        <p className="mt-2 hud-label">PERSONAL BEST // {highScore}</p>
      ) : null}
      <div className="mt-4">
        <PixelButton fullWidth onClick={onStart}>
          START
        </PixelButton>
      </div>
    </PixelPanel>
  )
}
