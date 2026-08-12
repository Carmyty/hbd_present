import { Volume2, VolumeX } from 'lucide-react'
import { displayNameUpper } from '../../data/identity'
import { useAudio } from '../../hooks/useAudio'
import { useProgress } from '../../hooks/useProgress'
import { PixelBadge } from '../ui/PixelBadge'
import { PixelProgressBar } from '../ui/PixelProgressBar'
import { BackButton } from './BackButton'

export function GameHUD({
  locationLabel,
  showBack = false,
  backTo = '/ship',
  backLabel = 'RETURN TO SHIP',
}: {
  locationLabel: string
  showBack?: boolean
  backTo?: string
  backLabel?: string
}) {
  const { progress, achievementCount, totalAchievements } = useProgress()
  const { prefs, setEnabled, setMuted, playUISound } = useAudio()
  const name = displayNameUpper(progress.identity)
  const level = progress.identity?.age ?? 0
  const modeBadge = progress.identity?.mode === 'memories' ? 'MEMORIES' : 'BOUNTY'

  return (
    <div className="mb-4 space-y-3">
      {showBack ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackButton to={backTo} label={backLabel} />
          <span className="hud-label hidden sm:inline">NAV // SHIP LINK</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="pixel-border pixel-panel p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <PixelBadge>{name}</PixelBadge>
            <PixelBadge>LVL {level}</PixelBadge>
            <PixelBadge>{modeBadge}</PixelBadge>
            <span className="hud-label">LOC // {locationLabel}</span>
          </div>
          <PixelProgressBar
            label="BOUNTY PROGRESS"
            value={achievementCount}
            max={totalAchievements}
          />
          <p className="mt-2 font-pixel text-[8px] text-[var(--text-muted)]">
            ACHIEVEMENTS {achievementCount} / {totalAchievements}
          </p>
        </div>

        <div className="pixel-border pixel-panel-mid flex items-center justify-between gap-3 p-3 sm:flex-col sm:justify-center">
          <span className="hud-label">AUDIO</span>
          <button
            type="button"
            className="touch-target pixel-btn pixel-btn-ghost px-3 py-2"
            aria-label={prefs.enabled && !prefs.muted ? 'Mute audio' : 'Enable audio'}
            onClick={() => {
              playUISound('click')
              if (!prefs.enabled) {
                setEnabled(true)
                setMuted(false)
                return
              }
              setMuted(!prefs.muted)
            }}
          >
            {prefs.enabled && !prefs.muted ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
