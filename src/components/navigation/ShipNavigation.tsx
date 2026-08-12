import { useNavigate } from 'react-router-dom'
import type { ShipLocation } from '../../types'
import { LocationButton } from './LocationButton'
import { PixelIcon } from '../ui/PixelIcon'
import { PixelPanel } from '../ui/PixelPanel'
import { useProgress } from '../../hooks/useProgress'
import { useAudio } from '../../hooks/useAudio'
import { useConsole } from '../../hooks/useConsole'

const LOCATIONS: ShipLocation[] = [
  'cockpit',
  'arcade',
  'radio',
  'database',
  'bounty-terminal',
]

const ROUTES: Record<ShipLocation, string> = {
  cockpit: '/ship',
  arcade: '/arcade',
  radio: '/radio',
  database: '/database',
  'bounty-terminal': '/bounty',
}

export function ShipNavigation({
  current,
  compact = false,
}: {
  current: ShipLocation
  compact?: boolean
}) {
  const navigate = useNavigate()
  const { progress, visitLocation, bumpEasterEgg } = useProgress()
  const { playUISound } = useAudio()
  const { say, noteInteraction } = useConsole()

  const onSelect = (location: ShipLocation) => {
    if (location === current) return
    playUISound('click')
    playUISound('navigate')
    noteInteraction(`nav-${location}`)
    visitLocation(location)
    navigate(ROUTES[location])
  }

  if (compact) {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-[var(--pixel-border)] bg-[var(--panel)]/95 px-2 py-2 backdrop-blur-sm md:hidden"
        aria-label="Ship locations"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onSelect(loc)}
              className={`touch-target flex flex-col items-center justify-center gap-1 px-1 py-2 font-pixel text-[7px] ${
                current === loc
                  ? 'bg-[var(--panel-light)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
              aria-current={current === loc ? 'page' : undefined}
            >
              <PixelIcon
                name={
                  loc === 'bounty-terminal'
                    ? 'bounty'
                    : loc === 'cockpit'
                      ? 'cockpit'
                      : loc
                }
                size={18}
              />
              {loc === 'bounty-terminal' ? 'BOUNTY' : loc.slice(0, 6).toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="hidden flex-col gap-2 md:flex">
        {LOCATIONS.map((loc) => (
          <LocationButton
            key={loc}
            location={loc}
            active={current === loc}
            onSelect={onSelect}
          />
        ))}
      </div>

      <PixelPanel className="relative min-h-[220px] overflow-hidden p-4">
        <button
          type="button"
          className="absolute inset-0 z-0"
          aria-label="Ship console"
          onClick={() => {
            const count = bumpEasterEgg('console')
            noteInteraction('ship-console')
            if (count >= 5) {
              playUISound('error')
              say('rapidClicks', { force: true })
            } else if (count >= 3) {
              say('rapidClicks')
            }
          }}
        />
        <div className="relative z-10 pointer-events-none">
          <p className="hud-label mb-2">SHIP COMPUTER // BB-01</p>
          <div className="mx-auto mt-4 flex max-w-md flex-col items-center">
            <svg viewBox="0 0 240 120" className="w-full max-w-sm text-[var(--accent)]">
              <rect x="20" y="40" width="200" height="50" fill="#1B2024" stroke="currentColor" strokeWidth="3" />
              <polygon points="40,40 120,10 200,40" fill="#15191C" stroke="currentColor" strokeWidth="3" />
              <rect x="95" y="55" width="50" height="20" fill="#24292D" stroke="currentColor" strokeWidth="2" />
              <rect x="30" y="90" width="20" height="10" fill="#B87E32" />
              <rect x="190" y="90" width="20" height="10" fill="#B87E32" />
              <circle cx="60" cy="65" r="4" fill="#768F62" />
              <circle cx="180" cy="65" r="4" fill="#9B4B43" />
            </svg>
            <p className="mt-3 text-center font-terminal text-lg text-[var(--text-secondary)]">
              {progress.easterEggCounts.console && progress.easterEggCounts.console >= 5
                ? 'PLEASE STOP PRESSING RANDOM BUTTONS.'
                : 'SELECT A LOCATION TO EXPLORE THE SHIP.'}
            </p>
            {progress.secretSignalUnlocked ? (
              <p className="mt-2 font-pixel text-[8px] text-[var(--danger)] blink">
                UNKNOWN SIGNAL DETECTED
              </p>
            ) : null}
          </div>
        </div>
      </PixelPanel>
    </div>
  )
}
