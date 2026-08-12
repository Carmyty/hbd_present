import { ACHIEVEMENTS } from '../../data/achievements'
import { useProgress } from '../../hooks/useProgress'
import { PixelBadge } from '../ui/PixelBadge'
import { PixelPanel } from '../ui/PixelPanel'

export function AchievementList() {
  const { progress } = useProgress()

  return (
    <div className="grid gap-2">
      {ACHIEVEMENTS.map((a) => {
        const unlocked = progress.unlockedAchievements.includes(a.id)
        return (
          <PixelPanel
            key={a.id}
            tone={unlocked ? 'light' : 'mid'}
            className={`p-3 ${unlocked ? '' : 'opacity-60'}`}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <PixelBadge>{unlocked ? 'UNLOCKED' : 'LOCKED'}</PixelBadge>
              <span className="font-pixel text-[8px] text-[var(--highlight)]">
                {a.title}
              </span>
            </div>
            <p className="terminal-text text-base">{a.description}</p>
          </PixelPanel>
        )
      })}
    </div>
  )
}
