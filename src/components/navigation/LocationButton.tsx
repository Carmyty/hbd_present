import { PixelIcon } from '../ui/PixelIcon'
import { PixelPanel } from '../ui/PixelPanel'
import { useHoverSoundProps } from '../../hooks/useAudio'
import type { ShipLocation } from '../../types'

const META: Record<
  ShipLocation,
  { label: string; icon: 'cockpit' | 'arcade' | 'radio' | 'database' | 'bounty' }
> = {
  cockpit: { label: 'COCKPIT', icon: 'cockpit' },
  arcade: { label: 'ARCADE', icon: 'arcade' },
  radio: { label: 'RADIO', icon: 'radio' },
  database: { label: 'DATABASE', icon: 'database' },
  'bounty-terminal': { label: 'BOUNTY', icon: 'bounty' },
}

export function LocationButton({
  location,
  active,
  locked,
  onSelect,
}: {
  location: ShipLocation
  active?: boolean
  locked?: boolean
  onSelect: (location: ShipLocation) => void
}) {
  const meta = META[location]
  const hoverProps = useHoverSoundProps(!locked)

  return (
    <button
      type="button"
      onClick={() => onSelect(location)}
      disabled={locked}
      className="touch-target w-full text-left"
      aria-label={meta.label}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={hoverProps.onMouseEnter}
    >
      <PixelPanel
        tone={active ? 'light' : 'mid'}
        className={`flex items-center gap-3 p-3 transition-[filter] ${
          active ? 'ring-2 ring-[var(--accent)]' : ''
        } ${locked ? 'opacity-50' : 'hover:brightness-110'}`}
      >
        <span className="text-[var(--accent)]">
          <PixelIcon name={meta.icon} size={28} />
        </span>
        <span className="font-pixel text-[9px] tracking-wide text-[var(--text-primary)]">
          {meta.label}
          {locked ? ' // LOCKED' : ''}
        </span>
      </PixelPanel>
    </button>
  )
}
