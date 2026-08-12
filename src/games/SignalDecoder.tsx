import { useCallback, useEffect, useRef, useState } from 'react'
import { GameContainer } from '../components/games/GameContainer'
import { GameResult } from '../components/games/GameResult'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelBadge } from '../components/ui/PixelBadge'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'
import { useConsole } from '../hooks/useConsole'

interface RoundConfig {
  timeLimit: number
  /** Target zone half-width as fraction of bar (0–1). */
  zoneHalf: number
  moveSpeed: number
}

const ROUNDS: RoundConfig[] = [
  { timeLimit: 15, zoneHalf: 0.09, moveSpeed: 0 },
  { timeLimit: 12, zoneHalf: 0.065, moveSpeed: 0 },
  { timeLimit: 12, zoneHalf: 0.05, moveSpeed: 0.08 },
]

const LOCK_HOLD = 0.7
const TUNE_SPEED = 0.55

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function signalBars(distance: number, zoneHalf: number): string {
  const ratio = distance / Math.max(zoneHalf * 4, 0.01)
  if (ratio > 1.6) return '██░░░░░░░░'
  if (ratio > 1.1) return '████░░░░░░'
  if (ratio > 0.7) return '██████░░░░'
  if (ratio > 0.35) return '████████░░'
  return '██████████'
}

export function SignalDecoder({ onExit }: { onExit: () => void }) {
  const { progress, completeGame } = useProgress()
  const { playUISound } = useAudio()
  const { say } = useConsole()
  const personalBest = progress.highScores['signal-decoder'] ?? 0

  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [roundIndex, setRoundIndex] = useState(0)
  const [cursor, setCursor] = useState(0.2)
  const [target, setTarget] = useState(0.7)
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].timeLimit)
  const [lockProgress, setLockProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [lockedFlash, setLockedFlash] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const keys = useRef<Record<string, boolean>>({})
  const touchDir = useRef(0)
  const finished = useRef(false)
  const cursorRef = useRef(0.2)
  const targetRef = useRef(0.7)
  const targetVel = useRef(0)
  const lockHold = useRef(0)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)
  const timeRef = useRef(ROUNDS[0].timeLimit)
  const lastTs = useRef(0)
  const betweenRounds = useRef(false)
  const barRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const commentCooldown = useRef(0)
  const wasInZone = useRef(false)

  const reset = useCallback(() => {
    finished.current = false
    betweenRounds.current = false
    cursorRef.current = 0.2
    targetRef.current = 0.7
    targetVel.current = 0
    lockHold.current = 0
    scoreRef.current = 0
    roundRef.current = 0
    timeRef.current = ROUNDS[0].timeLimit
    lastTs.current = 0
    touchDir.current = 0
    dragging.current = false
    commentCooldown.current = 0
    wasInZone.current = false
    setStarted(false)
    setResult(null)
    setRoundIndex(0)
    setCursor(0.2)
    setTarget(0.7)
    setTimeLeft(ROUNDS[0].timeLimit)
    setLockProgress(0)
    setScore(0)
    setLockedFlash(false)
    setIsNewRecord(false)
  }, [])

  const beginRound = useCallback((index: number) => {
    const cfg = ROUNDS[index]
    const targetPos = 0.18 + Math.random() * 0.64
    const start =
      Math.random() > 0.5
        ? clamp01(targetPos - (0.22 + Math.random() * 0.2))
        : clamp01(targetPos + (0.22 + Math.random() * 0.2))

    betweenRounds.current = false
    roundRef.current = index
    targetRef.current = targetPos
    cursorRef.current = start
    targetVel.current =
      cfg.moveSpeed === 0
        ? 0
        : (Math.random() > 0.5 ? 1 : -1) * cfg.moveSpeed
    lockHold.current = 0
    timeRef.current = cfg.timeLimit
    lastTs.current = 0
    wasInZone.current = false

    setRoundIndex(index)
    setTarget(targetPos)
    setCursor(start)
    setTimeLeft(cfg.timeLimit)
    setLockProgress(0)
    setLockedFlash(false)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const setCursorFromClientX = useCallback((clientX: number) => {
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = clamp01((clientX - rect.left) / rect.width)
    cursorRef.current = ratio
    setCursor(ratio)
  }, [])

  useEffect(() => {
    if (!started || result) return
    let raf = 0

    const loop = (ts: number) => {
      if (finished.current) return
      if (!lastTs.current) lastTs.current = ts
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000)
      lastTs.current = ts

      if (betweenRounds.current) {
        raf = requestAnimationFrame(loop)
        return
      }

      const cfg = ROUNDS[roundRef.current]
      if (!cfg) return

      if (commentCooldown.current > 0) commentCooldown.current -= dt

      if (!dragging.current) {
        let dir = touchDir.current
        if (keys.current.a || keys.current.arrowleft) dir -= 1
        if (keys.current.d || keys.current.arrowright) dir += 1
        if (dir !== 0) {
          cursorRef.current = clamp01(
            cursorRef.current + Math.sign(dir) * TUNE_SPEED * dt,
          )
        }
      }

      if (cfg.moveSpeed > 0) {
        targetRef.current += targetVel.current * dt
        if (targetRef.current <= 0.12 || targetRef.current >= 0.88) {
          targetVel.current *= -1
          targetRef.current = clamp01(targetRef.current)
        }
      }

      const distance = Math.abs(cursorRef.current - targetRef.current)
      const inRange = distance <= cfg.zoneHalf

      if (inRange && !wasInZone.current) {
        playUISound('signalLock')
        wasInZone.current = true
      } else if (!inRange && wasInZone.current) {
        wasInZone.current = false
        if (commentCooldown.current <= 0) {
          say('signalDecoder')
          commentCooldown.current = 3.5
        }
      }

      if (inRange) {
        lockHold.current = Math.min(LOCK_HOLD, lockHold.current + dt)
      } else {
        lockHold.current = Math.max(0, lockHold.current - dt * 0.9)
      }

      timeRef.current -= dt

      setCursor(cursorRef.current)
      setTarget(targetRef.current)
      setLockProgress(lockHold.current / LOCK_HOLD)
      setTimeLeft(Math.max(0, timeRef.current))

      if (lockHold.current >= LOCK_HOLD) {
        const closeness = Math.max(0, 1 - distance / cfg.zoneHalf)
        const roundBonus =
          Math.floor(timeRef.current * 35) + Math.floor(closeness * 80)
        scoreRef.current += Math.max(120, Math.floor(180 + roundBonus))
        setScore(scoreRef.current)
        setLockedFlash(true)
        lockHold.current = 0
        playUISound('signalLock', { force: true })

        if (roundRef.current >= ROUNDS.length - 1) {
          finished.current = true
          const finalScore = scoreRef.current
          setIsNewRecord(finalScore > personalBest)
          playUISound('gameSuccess', { force: true })
          setResult('win')
          completeGame('signal-decoder', finalScore)
          say('gameSuccess', { force: true })
          return
        }

        betweenRounds.current = true
        const next = roundRef.current + 1
        window.setTimeout(() => {
          if (!finished.current) beginRound(next)
        }, 550)
        raf = requestAnimationFrame(loop)
        return
      }

      if (timeRef.current <= 0) {
        finished.current = true
        setScore(scoreRef.current)
        playUISound('gameOver', { force: true })
        setResult('lose')
        say('gameFailure', { force: true })
        return
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lastTs.current = 0
    }
  }, [
    started,
    result,
    beginRound,
    completeGame,
    personalBest,
    playUISound,
    say,
  ])

  const cfg = ROUNDS[roundIndex]
  const distance = Math.abs(cursor - target)
  const inRange = cfg ? distance <= cfg.zoneHalf : false
  const bars = inRange ? '██████████' : signalBars(distance, cfg?.zoneHalf ?? 0.08)
  const zoneLeft = clamp01(target - (cfg?.zoneHalf ?? 0.08))
  const zoneWidth = Math.min(1 - zoneLeft, (cfg?.zoneHalf ?? 0.08) * 2)

  return (
    <GameContainer title="SIGNAL DECODER" onExit={onExit}>
      {!started && !result ? (
        <div className="space-y-3">
          <p className="terminal-text">
            An encrypted transmission has been intercepted. Move the marker
            along the frequency bar and lock onto the signal.
          </p>
          <p className="terminal-text">
            Hold inside the target zone for ~0.7s to lock. Three rounds.
          </p>
          <p className="hud-label">DESKTOP: ← → / A D · MOBILE: LEFT / RIGHT</p>
          <p className="hud-label">PERSONAL BEST // {personalBest}</p>
          <PixelButton
            sfx="confirm"
            onClick={() => {
              reset()
              beginRound(0)
              playUISound('gameStart', { force: true })
              setStarted(true)
            }}
          >
            BEGIN DECODE
          </PixelButton>
        </div>
      ) : null}

      {started && !result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <PixelBadge>
              ROUND {roundIndex + 1}/{ROUNDS.length}
            </PixelBadge>
            <PixelBadge>TIME {Math.ceil(timeLeft)}s</PixelBadge>
            <PixelBadge>SCORE {score}</PixelBadge>
          </div>

          <div className="pixel-border pixel-panel-mid p-4">
            <div className="mb-2 flex justify-between font-pixel text-[7px] text-[var(--text-muted)]">
              <span>LOW FREQUENCY</span>
              <span>HIGH FREQUENCY</span>
            </div>

            <div
              ref={barRef}
              className="relative h-16 w-full cursor-pointer touch-none border-2 border-[var(--pixel-border)] bg-black select-none"
              onPointerDown={(e) => {
                dragging.current = true
                e.currentTarget.setPointerCapture(e.pointerId)
                setCursorFromClientX(e.clientX)
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return
                setCursorFromClientX(e.clientX)
              }}
              onPointerUp={() => {
                dragging.current = false
              }}
              onPointerCancel={() => {
                dragging.current = false
              }}
              role="slider"
              aria-label="Frequency tuner"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(cursor * 100)}
              tabIndex={0}
            >
              {/* Subtle target zone — not exact pinpoint */}
              <div
                className="pointer-events-none absolute top-1 bottom-1 opacity-35"
                style={{
                  left: `${zoneLeft * 100}%`,
                  width: `${zoneWidth * 100}%`,
                  background:
                    'repeating-linear-gradient(90deg, transparent, transparent 3px, color-mix(in srgb, var(--accent) 35%, transparent) 3px, color-mix(in srgb, var(--accent) 35%, transparent) 6px)',
                }}
              />
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--accent)]/40"
                style={{ left: `${target * 100}%` }}
              />

              {/* Player cursor */}
              <div
                className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${cursor * 100}%` }}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center border-2 font-pixel text-[10px] ${
                    inRange
                      ? 'border-[var(--success)] bg-[var(--success)]/20 text-[var(--success)]'
                      : 'border-[var(--highlight)] bg-[var(--panel-light)] text-[var(--highlight)]'
                  }`}
                >
                  ●
                </div>
              </div>
            </div>

            <p className="mt-4 hud-label">SIGNAL STRENGTH</p>
            <p
              className={`mt-1 font-pixel text-[12px] tracking-widest ${
                inRange ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {bars}
            </p>

            <p className="mt-4 hud-label">LOCK</p>
            <div className="mt-1 h-3 w-full border border-[var(--pixel-border)] bg-black">
              <div
                className="h-full bg-[var(--accent)] transition-[width] duration-75"
                style={{ width: `${Math.round(lockProgress * 100)}%` }}
              />
            </div>

            {lockedFlash ? (
              <p className="mt-3 font-pixel text-[10px] text-[var(--success)]">
                SIGNAL LOCKED
              </p>
            ) : inRange ? (
              <p className="mt-3 font-pixel text-[8px] text-[var(--accent)]">
                HOLD FREQUENCY...
              </p>
            ) : (
              <p className="mt-3 font-pixel text-[8px] text-[var(--text-muted)]">
                SEEKING SIGNAL...
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => {
                touchDir.current = -1
              }}
              onPointerUp={() => {
                touchDir.current = 0
              }}
              onPointerLeave={() => {
                touchDir.current = 0
              }}
            >
              ← LEFT
            </PixelButton>
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => {
                touchDir.current = 1
              }}
              onPointerUp={() => {
                touchDir.current = 0
              }}
              onPointerLeave={() => {
                touchDir.current = 0
              }}
            >
              RIGHT →
            </PixelButton>
          </div>
        </div>
      ) : null}

      {result ? (
        <GameResult
          title={result === 'win' ? 'SIGNAL DECODED' : 'MISSION FAILED'}
          achievement={result === 'win' ? 'DECODED THE SIGNAL' : undefined}
          message={
            result === 'win'
              ? 'All frequencies locked. Transmission clear.'
              : 'Signal lost. Retune and try again.'
          }
          score={score}
          personalBest={Math.max(personalBest, score)}
          isNewRecord={isNewRecord}
          onRetry={reset}
          onContinue={onExit}
        />
      ) : null}
    </GameContainer>
  )
}
