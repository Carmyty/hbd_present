import { useNavigate } from 'react-router-dom'
import { getMission, MISSION_OBJECTIVES } from '../data/missions'
import { isMissionComplete } from '../data/progressLogic'
import { GameHUD } from '../components/navigation/GameHUD'
import { ShipNavigation } from '../components/navigation/ShipNavigation'
import { PixelBadge } from '../components/ui/PixelBadge'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelProgressBar } from '../components/ui/PixelProgressBar'
import { PixelWindow } from '../components/ui/PixelWindow'
import { useProgress } from '../hooks/useProgress'

export function BountyTerminal() {
  const navigate = useNavigate()
  const { progress, achievementCount, totalAchievements } = useProgress()
  const mission = getMission(progress.identity?.mode ?? 'birthday')
  const completed = MISSION_OBJECTIVES.filter((o) => o.check(progress)).length
  const missionComplete = isMissionComplete(progress)
  const finaleLabel =
    progress.identity?.mode === 'memories'
      ? 'OPEN MEMORY ARCHIVE'
      : 'OPEN BIRTHDAY SIGNAL'

  return (
    <div className="screen-frame pb-24 md:pb-8">
      <GameHUD locationLabel="BOUNTY TERMINAL" showBack />
      <ShipNavigation current="bounty-terminal" compact />

      <PixelWindow
        title="BOUNTY TERMINAL"
        actions={<PixelBadge>MISSION {mission.code}</PixelBadge>}
      >
        <p className="font-pixel text-[11px] text-[var(--highlight)]">{mission.title}</p>
        <p className="mt-3 terminal-text text-xl">{mission.description}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="pixel-border pixel-panel-mid p-3">
            <p className="hud-label">STATUS</p>
            <p className="font-pixel text-[9px] text-[var(--accent)]">
              {missionComplete ? 'COMPLETE' : 'ACTIVE'}
            </p>
          </div>
          <div className="pixel-border pixel-panel-mid p-3">
            <p className="hud-label">OBJECTIVES</p>
            <p className="font-pixel text-[9px] text-[var(--text-primary)]">
              {completed}/{MISSION_OBJECTIVES.length}
            </p>
          </div>
          <div className="pixel-border pixel-panel-mid p-3">
            <p className="hud-label">REWARD</p>
            <p className="font-pixel text-[9px] text-[var(--text-primary)]">
              {mission.reward}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <PixelProgressBar
            label="BOUNTY PROGRESS"
            value={achievementCount}
            max={totalAchievements}
          />
        </div>

        <ul className="mt-4 space-y-2">
          {MISSION_OBJECTIVES.map((obj) => {
            const done = obj.check(progress)
            return (
              <li
                key={obj.id}
                className="pixel-border pixel-panel-mid px-3 py-2 font-terminal text-lg"
              >
                <span className={done ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                  [{done ? '✓' : ' '}] {obj.label}
                </span>
              </li>
            )
          })}
        </ul>

        {progress.secretSignalUnlocked && !progress.secretSignalFound ? (
          <div className="mt-5">
            <p className="mb-3 font-pixel text-[8px] text-[var(--danger)] blink">
              UNKNOWN SIGNAL DETECTED.
            </p>
            <PixelButton fullWidth sfx="confirm" onClick={() => navigate('/secret')}>
              TUNE IN
            </PixelButton>
          </div>
        ) : null}

        {progress.secretSignalFound && !progress.finalMissionComplete ? (
          <div className="mt-5">
            <PixelButton fullWidth onClick={() => navigate('/birthday')}>
              {finaleLabel}
            </PixelButton>
          </div>
        ) : null}

        {missionComplete ? (
          <div className="mt-5">
            <PixelButton fullWidth variant="success" onClick={() => navigate('/reward')}>
              VIEW REWARD
            </PixelButton>
          </div>
        ) : null}
      </PixelWindow>
    </div>
  )
}
