import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelPanel } from '../components/ui/PixelPanel'
import { TerminalCursor } from '../components/effects/TerminalCursor'
import { Starfield } from '../components/effects/Starfield'
import {
  parseLocalDate,
  resolveGate,
  type UserIdentity,
} from '../data/identity'
import { useProgress } from '../hooks/useProgress'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAudio } from '../hooks/useAudio'

type Phase = 'identity' | 'denied' | 'boot'

function buildBootLines(age: number): string[] {
  const major = Math.floor(age / 10)
  const minor = age % 10
  return [
    'SYSTEM BOOT...',
    'INITIALIZING BOUNTY NETWORK...',
    'CONNECTING TO DEEP SPACE RELAY...',
    'LOADING SHIP SYSTEM...',
    'VERIFYING SIGNAL...',
    '████████████████████ 100%',
    'CONNECTION ESTABLISHED.',
    '',
    'BOUNTY NETWORK',
    `INTERFACE v${major}.${minor}`,
  ]
}

export function Boot() {
  const navigate = useNavigate()
  const { progress, registerIdentity, completeBoot } = useProgress()
  const { playUISound } = useAudio()
  const reduced = useReducedMotion()

  const [phase, setPhase] = useState<Phase>(() =>
    progress.identity ? 'boot' : 'identity',
  )
  const [name, setName] = useState(progress.identity?.name ?? '')
  const [birthDate, setBirthDate] = useState(progress.identity?.birthDate ?? '')
  const [denyReason, setDenyReason] = useState(
    'ACCESS WINDOW LOCKED // SUBJECT SIGNAL NOT IN RANGE',
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [bootAge, setBootAge] = useState(progress.identity?.age ?? 0)
  const [bootName, setBootName] = useState(
    progress.identity?.name.toUpperCase() ?? 'CREW',
  )

  const lines = useMemo(() => buildBootLines(bootAge), [bootAge])
  const [lineCount, setLineCount] = useState(reduced ? lines.length : 0)
  const done = lineCount >= lines.length
  const visible = useMemo(() => lines.slice(0, lineCount), [lines, lineCount])

  useEffect(() => {
    if (progress.bootComplete && progress.identity) {
      navigate(progress.acceptedBounty ? '/ship' : '/bounty-network', {
        replace: true,
      })
    }
  }, [
    progress.bootComplete,
    progress.acceptedBounty,
    progress.identity,
    navigate,
  ])

  useEffect(() => {
    if (phase !== 'boot' || reduced || done) return
    const id = window.setInterval(() => {
      setLineCount((c) => c + 1)
    }, 420)
    return () => window.clearInterval(id)
  }, [phase, reduced, done])

  useEffect(() => {
    if (phase !== 'boot' || reduced || lineCount === 0 || lineCount > lines.length) {
      return
    }
    if (lineCount % 2 === 0) playUISound('terminalType')
  }, [phase, lineCount, lines.length, reduced, playUISound])

  const finish = () => {
    completeBoot()
    playUISound('confirm')
    navigate('/bounty-network')
  }

  const skipBoot = () => {
    if (!done) {
      setLineCount(lines.length)
      return
    }
    finish()
  }

  useEffect(() => {
    if (phase !== 'boot') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (lineCount < lines.length) {
          setLineCount(lines.length)
          return
        }
        completeBoot()
        playUISound('confirm')
        navigate('/bounty-network')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, lineCount, lines.length, completeBoot, playUISound, navigate])

  const onSubmitIdentity = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setFormError('ENTER A VALID CALLSIGN (2+ CHARS).')
      playUISound('error')
      return
    }

    const parsed = parseLocalDate(birthDate)
    if (!parsed) {
      setFormError('ENTER A VALID BIRTH DATE.')
      playUISound('error')
      return
    }

    if (parsed.getTime() > Date.now()) {
      setFormError('TEMPORAL ANOMALY // FUTURE DATE REJECTED.')
      playUISound('error')
      return
    }

    const gate = resolveGate(parsed)
    if (gate.status === 'denied') {
      setDenyReason(gate.reason)
      setPhase('denied')
      playUISound('error')
      return
    }

    const identity: UserIdentity = {
      name: trimmed.slice(0, 24),
      birthDate,
      age: gate.age,
      mode: gate.mode,
    }
    registerIdentity(identity)
    setBootAge(gate.age)
    setBootName(identity.name.toUpperCase())
    setLineCount(reduced ? buildBootLines(gate.age).length : 0)
    setPhase('boot')
    playUISound('confirm')
  }

  if (phase === 'identity') {
    return (
      <div className="relative min-h-[100dvh]">
        <Starfield density={80} />
        <div className="screen-frame flex items-center justify-center">
          <motion.div
            className="w-full max-w-2xl"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <PixelPanel className="p-4 sm:p-6">
              <p className="mb-2 font-pixel text-[10px] text-[var(--accent)]">
                BIRTHDAY BOUNTY // ACCESS GATE
              </p>
              <p className="mb-5 terminal-text text-xl leading-relaxed">
                Identify yourself to open the bounty channel.
              </p>

              <form className="space-y-4" onSubmit={onSubmitIdentity}>
                <label className="block space-y-2">
                  <span className="hud-label">CALLSIGN // NAME</span>
                  <input
                    className="pixel-input w-full"
                    type="text"
                    name="callsign"
                    autoComplete="nickname"
                    maxLength={24}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    placeholder="ENTER NAME"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="hud-label">BIRTH DATE</span>
                  <input
                    className="pixel-input w-full"
                    type="date"
                    name="birthDate"
                    value={birthDate}
                    onChange={(ev) => setBirthDate(ev.target.value)}
                    required
                  />
                </label>

                {formError ? (
                  <p className="font-pixel text-[8px] leading-relaxed text-[var(--danger)]">
                    {formError}
                  </p>
                ) : (
                  <p className="font-pixel text-[8px] leading-relaxed text-[var(--text-muted)]">
                    CLEARANCE DEPENDS ON YOUR BIRTH SIGNAL.
                  </p>
                )}

                <PixelButton fullWidth type="submit" sfx={false}>
                  VERIFY SIGNAL
                </PixelButton>
              </form>
            </PixelPanel>
          </motion.div>
        </div>
      </div>
    )
  }

  if (phase === 'denied') {
    return (
      <div className="relative min-h-[100dvh]">
        <Starfield density={40} />
        <div className="screen-frame flex items-center justify-center">
          <PixelPanel className="w-full max-w-2xl p-4 sm:p-6">
            <p className="font-pixel text-[10px] text-[var(--danger)]">ACCESS DENIED</p>
            <p className="mt-4 terminal-text text-xl leading-relaxed">{denyReason}</p>
            <p className="mt-3 terminal-text text-lg text-[var(--text-secondary)]">
              This channel only opens for a valid birth window.
            </p>
            <div className="mt-6">
              <PixelButton
                fullWidth
                variant="ghost"
                onClick={() => {
                  setPhase('identity')
                  playUISound('click')
                }}
              >
                RETRY IDENTITY
              </PixelButton>
            </div>
          </PixelPanel>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh]" onClick={skipBoot} role="presentation">
      <Starfield density={80} />
      <div className="screen-frame flex items-center justify-center">
        <motion.div
          className="w-full max-w-2xl"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PixelPanel className="p-4 sm:p-6">
            <p className="mb-4 font-pixel text-[10px] text-[var(--accent)]">
              BIRTHDAY BOUNTY // {bootName}
            </p>
            <div className="terminal-text min-h-[220px] text-xl leading-relaxed">
              {visible.map((line, i) => (
                <div key={`${line}-${i}`}>{line || '\u00A0'}</div>
              ))}
              {!done ? <TerminalCursor /> : null}
            </div>
            {done ? (
              <div className="mt-6">
                <PixelButton fullWidth sfx={false} onClick={finish}>
                  <span className="hidden sm:inline">[ PRESS ENTER ]</span>
                  <span className="sm:hidden">[ TAP TO START ]</span>
                </PixelButton>
              </div>
            ) : (
              <p className="mt-4 hud-label">TAP / KEY TO SKIP</p>
            )}
          </PixelPanel>
        </motion.div>
      </div>
    </div>
  )
}
