import { useNavigate } from 'react-router-dom'
import { GameHUD } from '../components/navigation/GameHUD'
import { ShipNavigation } from '../components/navigation/ShipNavigation'
import { AchievementList } from '../components/achievements/AchievementList'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelWindow } from '../components/ui/PixelWindow'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'

export function Bebop() {
  const navigate = useNavigate()
  const { progress, resetProgress } = useProgress()
  const { stopRadio } = useAudio()

  const handleReset = () => {
    stopRadio()
    resetProgress()
    navigate('/', { replace: true })
  }

  return (
    <div className="screen-frame pb-24 md:pb-8">
      <GameHUD locationLabel="COCKPIT" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-pixel text-[12px] leading-relaxed text-[var(--highlight)]">
          THE BEBOP // SHIP COMPUTER
        </h1>
        {progress.secretSignalUnlocked ? (
          <PixelButton className="!text-[8px]" onClick={() => navigate('/secret')}>
            TUNE UNKNOWN SIGNAL
          </PixelButton>
        ) : null}
      </div>

      <ShipNavigation current="cockpit" />
      <ShipNavigation current="cockpit" compact />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PixelWindow title="CREW LOG">
          <p className="terminal-text text-lg">
            Welcome aboard, {progress.identity?.name ?? 'crew'}. The ship systems
            are online. Explore the arcade, radio, database, and bounty terminal.
          </p>
          <p className="mt-3 terminal-text text-lg">
            Tip: complete objectives to decrypt the unknown frequency.
          </p>
        </PixelWindow>
        <PixelWindow title="ACHIEVEMENTS">
          <AchievementList />
        </PixelWindow>
      </div>

      <details className="mt-4 pixel-border pixel-panel p-3">
        <summary className="cursor-pointer font-pixel text-[8px] text-[var(--text-muted)]">
          DEV // SETTINGS
        </summary>
        <p className="mt-2 terminal-text text-base">
          Hidden reset for local testing. This clears localStorage progress.
        </p>
        <div className="mt-3">
          <PixelButton variant="danger" onClick={handleReset}>
            RESET PROGRESS
          </PixelButton>
        </div>
      </details>
    </div>
  )
}
