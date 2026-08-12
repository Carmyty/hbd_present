import { PixelButton } from '../ui/PixelButton'
import { PixelPanel } from '../ui/PixelPanel'

export function GameResult({
  title,
  message,
  achievement,
  score,
  personalBest,
  isNewRecord,
  stats,
  onRetry,
  onContinue,
}: {
  title: string
  message: string
  achievement?: string
  score?: number
  personalBest?: number
  isNewRecord?: boolean
  stats?: { label: string; value: string }[]
  onRetry: () => void
  onContinue: () => void
}) {
  return (
    <PixelPanel tone="light" className="p-4 text-center">
      <p className="font-pixel text-[10px] text-[var(--accent)]">{title}</p>
      {typeof score === 'number' ? (
        <p className="mt-3 font-pixel text-[12px] text-[var(--highlight)]">
          SCORE // {score}
        </p>
      ) : null}
      {typeof personalBest === 'number' ? (
        <p className="mt-2 hud-label">PERSONAL BEST // {personalBest}</p>
      ) : null}
      {isNewRecord ? (
        <p className="mt-2 font-pixel text-[9px] text-[var(--success)]">
          NEW PERSONAL BEST
        </p>
      ) : null}
      {stats && stats.length > 0 ? (
        <div className="mt-3 space-y-2">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="hud-label">{stat.label}</p>
              <p className="mt-1 font-pixel text-[9px] text-[var(--highlight)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {achievement ? (
        <p className="mt-3 font-pixel text-[8px] text-[var(--success)]">
          ACHIEVEMENT UNLOCKED
          <br />
          &quot;{achievement}&quot;
        </p>
      ) : null}
      <p className="mt-4 terminal-text text-lg">{message}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <PixelButton variant="ghost" onClick={onRetry}>
          RETRY
        </PixelButton>
        <PixelButton onClick={onContinue}>CONTINUE</PixelButton>
      </div>
    </PixelPanel>
  )
}
