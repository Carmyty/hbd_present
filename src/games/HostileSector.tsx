import { useCallback, useEffect, useRef, useState } from 'react'
import { GameContainer } from '../components/games/GameContainer'
import { GameResult } from '../components/games/GameResult'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelProgressBar } from '../components/ui/PixelProgressBar'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'
import { useConsole } from '../hooks/useConsole'

type Dir = { x: number; y: number }

interface Entity {
  x: number
  y: number
  w: number
  h: number
  vx?: number
  vy?: number
}

const W = 320
const H = 200
const DURATION = 30
const MAX_HP = 4
const INVULN_MS = 900
const PLAYER_SPEED = 135

function rectsOverlap(a: Entity, b: Entity) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

function phaseConfig(elapsed: number) {
  if (elapsed < 10) return { count: 1, speedMul: 0.75 }
  if (elapsed < 20) return { count: 2, speedMul: 1.0 }
  return { count: 3, speedMul: 1.15 }
}

function spawnEnemy(speedMul: number): Entity {
  const side = Math.floor(Math.random() * 4)
  const h: Entity = {
    x: 0,
    y: 0,
    w: 10,
    h: 10,
    vx: 0,
    vy: 0,
  }
  const spd = (40 + Math.random() * 20) * speedMul
  if (side === 0) {
    h.x = Math.random() * (W - 10)
    h.y = -12
    h.vy = spd
    h.vx = (Math.random() - 0.5) * spd * 0.35
  } else if (side === 1) {
    h.x = Math.random() * (W - 10)
    h.y = H + 12
    h.vy = -spd
    h.vx = (Math.random() - 0.5) * spd * 0.35
  } else if (side === 2) {
    h.x = -12
    h.y = Math.random() * (H - 10)
    h.vx = spd
    h.vy = (Math.random() - 0.5) * spd * 0.35
  } else {
    h.x = W + 12
    h.y = Math.random() * (H - 10)
    h.vx = -spd
    h.vy = (Math.random() - 0.5) * spd * 0.35
  }
  return h
}

export function HostileSector({ onExit }: { onExit: () => void }) {
  const { progress, completeGame } = useProgress()
  const { playUISound } = useAudio()
  const { say } = useConsole()
  const personalBest = progress.highScores['hostile-sector'] ?? 0
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [hp, setHp] = useState(MAX_HP)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [score, setScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef<Record<string, boolean>>({})
  const touchDir = useRef<Dir>({ x: 0, y: 0 })
  const player = useRef<Entity>({ x: 150, y: 90, w: 12, h: 12 })
  const hazards = useRef<Entity[]>([])
  const particles = useRef<{ x: number; y: number; life: number }[]>([])
  const lastTs = useRef(0)
  const elapsed = useRef(0)
  const finished = useRef(false)
  const hpRef = useRef(MAX_HP)
  const invulnUntil = useRef(0)
  const dodgeScore = useRef(0)
  const nearMissCooldown = useRef(0)
  const hitCommentCooldown = useRef(0)

  const reset = useCallback(() => {
    player.current = { x: 150, y: 90, w: 12, h: 12 }
    hazards.current = []
    particles.current = []
    elapsed.current = 0
    finished.current = false
    hpRef.current = MAX_HP
    invulnUntil.current = 0
    dodgeScore.current = 0
    nearMissCooldown.current = 0
    hitCommentCooldown.current = 0
    setHp(MAX_HP)
    setTimeLeft(DURATION)
    setScore(0)
    setIsNewRecord(false)
    setResult(null)
    setStarted(false)
  }, [])

  const endGame = useCallback(
    (won: boolean, finalScore: number) => {
      if (finished.current) return
      finished.current = true
      setScore(finalScore)
      setIsNewRecord(won && finalScore > personalBest)
      setResult(won ? 'win' : 'lose')
      if (won) {
        playUISound('gameSuccess', { force: true })
        completeGame('hostile-sector', finalScore)
        if (hpRef.current <= 1) {
          say('gameCloseCall', { force: true })
        } else {
          say('gameSuccess', { force: true })
        }
      } else {
        playUISound('gameOver', { force: true })
        say('gameFailure', { force: true })
      }
    },
    [completeGame, personalBest, playUISound, say],
  )

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

  useEffect(() => {
    if (!started || result) return
    let raf = 0

    const ensureEnemyCount = (count: number, speedMul: number) => {
      while (hazards.current.length < count) {
        hazards.current.push(spawnEnemy(speedMul))
      }
    }

    const loop = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts
      const dt = Math.min(0.033, (ts - lastTs.current) / 1000)
      lastTs.current = ts

      elapsed.current += dt
      const remain = Math.max(0, DURATION - elapsed.current)
      setTimeLeft(Math.ceil(remain))

      if (hitCommentCooldown.current > 0) hitCommentCooldown.current -= dt

      const phase = phaseConfig(elapsed.current)
      ensureEnemyCount(phase.count, phase.speedMul)

      let mx = touchDir.current.x
      let my = touchDir.current.y
      if (keys.current.a || keys.current.arrowleft) mx -= 1
      if (keys.current.d || keys.current.arrowright) mx += 1
      if (keys.current.w || keys.current.arrowup) my -= 1
      if (keys.current.s || keys.current.arrowdown) my += 1
      const len = Math.hypot(mx, my) || 1
      const moving = mx !== 0 || my !== 0
      player.current.x = Math.max(
        0,
        Math.min(W - player.current.w, player.current.x + (mx / len) * PLAYER_SPEED * dt),
      )
      player.current.y = Math.max(
        0,
        Math.min(H - player.current.h, player.current.y + (my / len) * PLAYER_SPEED * dt),
      )

      if (nearMissCooldown.current > 0) nearMissCooldown.current -= dt

      hazards.current = hazards.current.map((h) => {
        let vx = h.vx ?? 0
        let vy = h.vy ?? 0

        let nx = h.x + vx * dt
        let ny = h.y + vy * dt

        if (nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) {
          const reentry = spawnEnemy(phase.speedMul)
          nx = reentry.x
          ny = reentry.y
          vx = reentry.vx ?? 0
          vy = reentry.vy ?? 0
        }

        const dx =
          player.current.x + player.current.w / 2 - (nx + h.w / 2)
        const dy =
          player.current.y + player.current.h / 2 - (ny + h.h / 2)
        const dist = Math.hypot(dx, dy)
        if (moving && dist < 28 && dist > 14 && nearMissCooldown.current <= 0) {
          dodgeScore.current += 15
          nearMissCooldown.current = 0.35
        }

        return { ...h, x: nx, y: ny, vx, vy }
      })

      if (hazards.current.length > phase.count) {
        hazards.current = hazards.current.slice(0, phase.count)
      }

      const now = performance.now()
      const invulnerable = now < invulnUntil.current

      if (!invulnerable) {
        for (const h of hazards.current) {
          if (rectsOverlap(player.current, h)) {
            particles.current.push({
              x: player.current.x + 6,
              y: player.current.y + 6,
              life: 0.35,
            })
            invulnUntil.current = now + INVULN_MS
            hpRef.current -= 1
            setHp(hpRef.current)
            if (hitCommentCooldown.current <= 0) {
              say('hostileSector')
              hitCommentCooldown.current = 4
            }
            if (hpRef.current <= 0) {
              const failScore =
                Math.floor(elapsed.current * 40) + dodgeScore.current
              endGame(false, failScore)
            }
            break
          }
        }
      }

      particles.current = particles.current
        .map((p) => ({ ...p, life: p.life - dt }))
        .filter((p) => p.life > 0)

      const liveScore =
        Math.floor(elapsed.current * 40) +
        dodgeScore.current +
        hpRef.current * 10
      setScore(liveScore)

      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#0B0D0F'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#1B2024'
        ctx.fillRect(0, H - 40, W, 40)
        ctx.fillStyle = '#24292D'
        for (let i = 0; i < 20; i++) {
          ctx.fillRect((i * 37) % W, H - 40 + ((i * 13) % 30), 4, 4)
        }

        const flash = invulnerable && Math.floor(now / 80) % 2 === 0
        if (!flash) {
          ctx.fillStyle = invulnerable ? '#E5D49B' : '#D3A84A'
          ctx.fillRect(player.current.x, player.current.y, 12, 12)
          ctx.fillStyle = invulnerable ? '#FFFFFF' : '#E5D49B'
          ctx.fillRect(player.current.x + 3, player.current.y + 3, 3, 3)
        }

        ctx.fillStyle = '#9B4B43'
        for (const h of hazards.current) {
          ctx.fillRect(h.x, h.y, h.w, h.h)
        }

        ctx.fillStyle = '#768F62'
        for (const p of particles.current) {
          ctx.globalAlpha = Math.max(0, p.life * 3)
          ctx.fillRect(p.x, p.y, 3, 3)
        }
        ctx.globalAlpha = 1
      }

      if (remain <= 0) {
        const finalScore =
          Math.floor(DURATION * 40) +
          dodgeScore.current +
          hpRef.current * 150
        endGame(true, finalScore)
        return
      }

      if (!finished.current) raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lastTs.current = 0
    }
  }, [started, result, endGame, say])

  const setTouch = (x: number, y: number) => {
    touchDir.current = { x, y }
  }

  return (
    <GameContainer title="HOSTILE SECTOR" onExit={onExit}>
      {!started && !result ? (
        <div className="space-y-3">
          <p className="font-pixel text-[10px] text-[var(--accent)]">
            SURVIVAL PROTOCOL
          </p>
          <p className="terminal-text">
            New pilot detected. Survival probability questionable.
          </p>
          <p className="terminal-text">MISSION: SURVIVE 30 SECONDS.</p>
          <p className="terminal-text">HP: {MAX_HP} · PRESSURE INCREASES OVER TIME</p>
          <p className="hud-label">
            PERSONAL BEST // {personalBest}
          </p>
          <p className="hud-label">DESKTOP: WASD / ARROWS · MOBILE: D-PAD</p>
          <PixelButton
            sfx="confirm"
            onClick={() => {
              reset()
              playUISound('gameStart', { force: true })
              setStarted(true)
            }}
          >
            BEGIN SURVIVAL
          </PixelButton>
        </div>
      ) : null}

      {started && !result ? (
        <div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <PixelProgressBar label="TIME" value={timeLeft} max={DURATION} />
            <PixelProgressBar label="HP" value={hp} max={MAX_HP} />
          </div>
          <div className="overflow-hidden border-2 border-[var(--pixel-border)] bg-black">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="mx-auto block h-auto w-full max-w-full"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
            <span />
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => setTouch(0, -1)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >
              ↑
            </PixelButton>
            <span />
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => setTouch(-1, 0)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >
              ←
            </PixelButton>
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => setTouch(0, 1)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >
              ↓
            </PixelButton>
            <PixelButton
              variant="ghost"
              sfx={false}
              onPointerDown={() => setTouch(1, 0)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >
              →
            </PixelButton>
          </div>
          <p className="mt-2 hud-label">SCORE // {score}</p>
        </div>
      ) : null}

      {result ? (
        <GameResult
          title={result === 'win' ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          achievement={result === 'win' ? 'SURVIVED HOSTILE SECTOR' : undefined}
          message={
            result === 'win'
              ? 'Sector cleared. Pressure systems offline.'
              : 'Hull integrity critical. Retry recommended.'
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
