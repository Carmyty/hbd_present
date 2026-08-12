import type { RadioStation as Station } from '../../types'
import { PixelPanel } from '../ui/PixelPanel'
import { useAudio, useHoverSoundProps } from '../../hooks/useAudio'
import { useConsole } from '../../hooks/useConsole'
import { useRef } from 'react'

export function RadioStationButton({
  station,
  active,
  locked,
  requirement,
  onSelect,
}: {
  station: Station
  active: boolean
  locked: boolean
  requirement?: string
  onSelect: () => void
}) {
  const isSecret = station.id === 'last-transmission'
  const { playUISound } = useAudio()
  const { noteLockedAccess, noteInteraction } = useConsole()
  const hoverProps = useHoverSoundProps(!locked)
  const deniedPlayed = useRef(false)

  return (
    <button
      type="button"
      onClick={() => {
        noteInteraction(`station-${station.id}`)
        if (locked) {
          if (!deniedPlayed.current) {
            playUISound('denied')
            deniedPlayed.current = true
            window.setTimeout(() => {
              deniedPlayed.current = false
            }, 800)
          }
          noteLockedAccess(station.id)
          return
        }
        onSelect()
      }}
      aria-disabled={locked}
      className="touch-target w-full text-left"
      onMouseEnter={hoverProps.onMouseEnter}
    >
      <PixelPanel
        tone={active ? 'light' : 'mid'}
        className={`p-3 ${active ? 'ring-2 ring-[var(--accent)]' : ''} ${
          locked ? 'opacity-50' : 'hover:brightness-110'
        }`}
      >
        <p className="font-pixel text-[8px] text-[var(--accent)]">{station.channel}</p>
        <p className="mt-1 font-pixel text-[10px] text-[var(--text-primary)]">
          {station.name}
        </p>
        {locked ? (
          <div className="mt-1 terminal-text text-base">
            <p>ACCESS DENIED</p>
            {requirement ? <p>REQUIREMENT: {requirement}</p> : null}
            {isSecret ? <p>ENCRYPTION: ACTIVE</p> : null}
          </div>
        ) : isSecret ? (
          <div className="mt-1 terminal-text text-base">
            <p>{station.description}</p>
            <p className="mt-1">ACCESS: GRANTED</p>
            <p>ENCRYPTION: DECRYPTED</p>
            <p>SIGNAL: STABLE</p>
          </div>
        ) : (
          <p className="mt-1 terminal-text text-base">{station.description}</p>
        )}
      </PixelPanel>
    </button>
  )
}
