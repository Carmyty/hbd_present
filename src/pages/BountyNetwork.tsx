import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelDivider } from '../components/ui/PixelDivider'
import { PixelWindow } from '../components/ui/PixelWindow'
import { PixelBadge } from '../components/ui/PixelBadge'
import { Starfield } from '../components/effects/Starfield'
import {
  displayNameUpper,
  formatBirthdayCode,
  parseLocalDate,
} from '../data/identity'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function BountyNetwork() {
  const navigate = useNavigate()
  const { progress, acceptBounty, bumpEasterEgg } = useProgress()
  const { playUISound } = useAudio()
  const reduced = useReducedMotion()
  const [accepted, setAccepted] = useState(progress.acceptedBounty)

  const identity = progress.identity
  const name = displayNameUpper(identity)
  const age = identity?.age ?? 0
  const birthday = identity
    ? formatBirthdayCode(parseLocalDate(identity.birthDate) ?? new Date())
    : '--.--'
  const statusLabel = identity?.mode === 'memories' ? 'ARCHIVED' : 'ACTIVE'

  const onAccept = () => {
    acceptBounty()
    setAccepted(true)
    window.setTimeout(() => navigate('/ship'), 1200)
  }

  return (
    <div className="relative min-h-[100dvh]">
      <Starfield density={50} />
      <div className="screen-frame">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PixelWindow
            title="BOUNTY NETWORK"
            actions={<PixelBadge>LIVE FEED</PixelBadge>}
          >
            <button
              type="button"
              className="mb-3 font-pixel text-[10px] text-[var(--danger)]"
              onClick={() => {
                const c = bumpEasterEgg('logo')
                if (c >= 5) playUISound('error')
              }}
            >
              NEW BOUNTY DETECTED
            </button>
            {progress.easterEggCounts.logo && progress.easterEggCounts.logo >= 5 ? (
              <p className="mb-3 terminal-text text-[var(--accent)]">
                Are you sure you&apos;re qualified to operate this terminal?
              </p>
            ) : null}

            <div className="grid gap-2 font-terminal text-xl sm:grid-cols-2">
              <p>
                TARGET: <span className="text-[var(--highlight)]">{name}</span>
              </p>
              <p>
                AGE: <span className="text-[var(--highlight)]">{age}</span>
              </p>
              <p>
                BIRTHDAY: <span className="text-[var(--highlight)]">{birthday}</span>
              </p>
              <p>
                STATUS:{' '}
                <span className="text-[var(--success)]">{statusLabel}</span>
              </p>
              <p className="sm:col-span-2">
                REWARD: <span className="text-[var(--accent)]">CLASSIFIED</span>
              </p>
            </div>

            <PixelDivider className="my-4" />

            {!accepted ? (
              <PixelButton fullWidth sfx="confirm" onClick={onAccept}>
                ACCEPT BOUNTY
              </PixelButton>
            ) : (
              <div className="space-y-2">
                <p className="font-pixel text-[10px] text-[var(--success)]">
                  MISSION ACCEPTED
                </p>
                <p className="terminal-text">TARGET PROFILE LOADED.</p>
                <p className="hud-label">TRANSFERRING TO SHIP...</p>
              </div>
            )}
          </PixelWindow>
        </motion.div>
      </div>
    </div>
  )
}
