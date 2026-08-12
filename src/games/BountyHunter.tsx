import { useCallback, useEffect, useRef, useState } from 'react'
import { GameContainer } from '../components/games/GameContainer'
import { GameResult } from '../components/games/GameResult'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelBadge } from '../components/ui/PixelBadge'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'
import { useConsole } from '../hooks/useConsole'

const TARGET_NAMES = [
  'LAG',
  'BAD RNG',
  'MONDAY',
  'ADULT RESPONSIBILITIES',
  'FINAL BOSS',
  'SPACE GOBLIN',
] as const

interface Target {
  id: number
  name: (typeof TARGET_NAMES)[number]
  x: number
  y: number
  spawnedAt: number
  lifetime: number
  size: 'lg' | 'md' | 'sm'
}

interface RoundConfig {
  targets: number
  lifetime: number
  size: 'lg' | 'md' | 'sm'
}

const ROUNDS: RoundConfig[] = [
  { targets: 8, lifetime: 1500, size: 'lg' },
  { targets: 8, lifetime: 1300, size: 'md' },
  { targets: 10, lifetime: 1100, size: 'md' },
  { targets: 10, lifetime: 950, size: 'sm' },
]

const TOTAL_TARGETS = ROUNDS.reduce((sum, r) => sum + r.targets, 0)
const BASE_POINTS = 100
const MISS_PENALTY = 40
const MIN_SPAWN_GAP = 18

const SIZE_CLASS: Record<Target['size'], string> = {
  lg: 'min-w-[110px] px-3 py-2.5 text-[8px]',
  md: 'min-w-[96px] px-2 py-2 text-[8px]',
  sm: 'min-w-[88px] px-2 py-1.5 text-[7px]',
}

export function BountyHunter({ onExit }: { onExit: () => void }) {
  const { progress, completeGame } = useProgress()
  const { playUISound } = useAudio()
  const { say } = useConsole()
  const personalBest = progress.highScores['bounty-hunter'] ?? 0

  const [started, setStarted] = useState(false)
  const [targets, setTargets] = useState<Target[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [hitsInRound, setHitsInRound] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [totalHits, setTotalHits] = useState(0)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const finished = useRef(false)
  const spawnTimer = useRef<number | null>(null)
  const tickTimer = useRef<number | null>(null)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const scoreRef = useRef(0)
  const missesRef = useRef(0)
  const totalHitsRef = useRef(0)
  const roundRef = useRef(0)
  const spawnedRef = useRef(0)
  const hitsRef = useRef(0)
  const resolvedRef = useRef(0)
  const activeIds = useRef<Set<number>>(new Set())
  const advancing = useRef(false)
  const lastSpawnPos = useRef<{ x: number; y: number } | null>(null)

  const clearTimers = useCallback(() => {
    if (spawnTimer.current) window.clearTimeout(spawnTimer.current)
    if (tickTimer.current) window.clearInterval(tickTimer.current)
    spawnTimer.current = null
    tickTimer.current = null
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    finished.current = false
    advancing.current = false
    comboRef.current = 0
    maxComboRef.current = 0
    scoreRef.current = 0
    missesRef.current = 0
    totalHitsRef.current = 0
    roundRef.current = 0
    spawnedRef.current = 0
    hitsRef.current = 0
    resolvedRef.current = 0
    lastSpawnPos.current = null
    activeIds.current.clear()
    setStarted(false)
    setTargets([])
    setRoundIndex(0)
    setHitsInRound(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setTotalHits(0)
    setIsNewRecord(false)
    setResult(null)
  }, [clearTimers])

  const win = useCallback(() => {
    if (finished.current) return
    finished.current = true
    clearTimers()
    setTargets([])
    const finalScore = scoreRef.current
    setScore(finalScore)
    setTotalHits(totalHitsRef.current)
    setMaxCombo(maxComboRef.current)
    setIsNewRecord(finalScore > personalBest)
    playUISound('gameSuccess', { force: true })
    setResult('win')
    completeGame('bounty-hunter', finalScore)
    const accuracy =
      TOTAL_TARGETS > 0
        ? totalHitsRef.current / TOTAL_TARGETS
        : 0
    if (accuracy >= 0.85) {
      say('gameSuccess', { force: true })
    } else {
      say('competent', { force: true })
    }
  }, [clearTimers, completeGame, personalBest, playUISound, say])

  const pickSpawnPosition = useCallback((): { x: number; y: number } => {
    let x = 18 + Math.random() * 64
    let y = 18 + Math.random() * 64
    const last = lastSpawnPos.current
    if (last) {
      let attempts = 0
      while (
        attempts < 12 &&
        Math.hypot(x - last.x, y - last.y) < MIN_SPAWN_GAP
      ) {
        x = 18 + Math.random() * 64
        y = 18 + Math.random() * 64
        attempts += 1
      }
    }
    lastSpawnPos.current = { x, y }
    return { x, y }
  }, [])

  const spawnOne = useCallback(() => {
    const round = ROUNDS[roundRef.current]
    if (!round || finished.current) return
    if (spawnedRef.current >= round.targets) return

    const name = TARGET_NAMES[Math.floor(Math.random() * TARGET_NAMES.length)]
    const id = Date.now() + Math.random()
    const pos = pickSpawnPosition()
    // Round 4: 900–1000ms lifetime
    const lifetime =
      roundRef.current === 3
        ? 900 + Math.floor(Math.random() * 101)
        : round.lifetime
    const target: Target = {
      id,
      name,
      x: pos.x,
      y: pos.y,
      spawnedAt: performance.now(),
      lifetime,
      size: round.size,
    }

    activeIds.current.add(id)
    spawnedRef.current += 1
    setTargets((prev) => [...prev, target])
  }, [pickSpawnPosition])

  const scheduleSpawns = useCallback(() => {
    const round = ROUNDS[roundRef.current]
    if (!round || finished.current) return

    const spawnNext = () => {
      if (finished.current) return
      if (spawnedRef.current >= round.targets) return
      spawnOne()
      if (spawnedRef.current < round.targets) {
        const gap = Math.max(280, round.lifetime * 0.55)
        spawnTimer.current = window.setTimeout(spawnNext, gap)
      }
    }

    spawnTimer.current = window.setTimeout(spawnNext, 200)
  }, [spawnOne])

  const startRound = useCallback(
    (index: number) => {
      if (spawnTimer.current) window.clearTimeout(spawnTimer.current)
      advancing.current = false
      roundRef.current = index
      spawnedRef.current = 0
      hitsRef.current = 0
      resolvedRef.current = 0
      lastSpawnPos.current = null
      activeIds.current.clear()
      setRoundIndex(index)
      setHitsInRound(0)
      setTargets([])
      scheduleSpawns()
    },
    [scheduleSpawns],
  )

  useEffect(() => {
    if (!started || result) return

    startRound(0)

    tickTimer.current = window.setInterval(() => {
      if (finished.current) return
      const now = performance.now()

      setTargets((prev) => {
        const kept: Target[] = []
        let expired = 0
        for (const t of prev) {
          if (now - t.spawnedAt >= t.lifetime) {
            if (activeIds.current.has(t.id)) {
              activeIds.current.delete(t.id)
              expired += 1
              resolvedRef.current += 1
            }
          } else {
            kept.push(t)
          }
        }

        if (expired > 0) {
          comboRef.current = 0
          setCombo(0)
          missesRef.current += expired
          scoreRef.current = Math.max(0, scoreRef.current - MISS_PENALTY * expired)
          setScore(scoreRef.current)
        }
        return kept
      })

      const round = ROUNDS[roundRef.current]
      if (
        !finished.current &&
        !advancing.current &&
        round &&
        resolvedRef.current >= round.targets
      ) {
        advancing.current = true
        if (roundRef.current >= ROUNDS.length - 1) {
          window.setTimeout(() => win(), 120)
        } else {
          window.setTimeout(() => {
            if (!finished.current) startRound(roundRef.current + 1)
          }, 350)
        }
      }
    }, 40)

    return () => clearTimers()
    // Intentionally only re-run when session starts/ends — round advances via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, result])

  const hit = (target: Target) => {
    if (finished.current) return
    if (!activeIds.current.has(target.id)) return
    activeIds.current.delete(target.id)
    resolvedRef.current += 1
    playUISound('click')

    const elapsed = performance.now() - target.spawnedAt
    const speedRatio = Math.max(0, 1 - elapsed / target.lifetime)
    const speedBonus = Math.floor(speedRatio * 50)

    const nextCombo = Math.min(5, comboRef.current + 1)
    comboRef.current = nextCombo
    if (nextCombo > maxComboRef.current) {
      maxComboRef.current = nextCombo
      setMaxCombo(nextCombo)
    }
    const gained = BASE_POINTS * nextCombo + speedBonus
    scoreRef.current += gained
    hitsRef.current += 1
    totalHitsRef.current += 1

    setCombo(nextCombo)
    setScore(scoreRef.current)
    setHitsInRound(hitsRef.current)
    setTotalHits(totalHitsRef.current)
    setTargets((prev) => prev.filter((t) => t.id !== target.id))

    if (nextCombo >= 4) {
      say('bountyHunter')
    }
  }

  const missEmpty = () => {
    if (finished.current) return
    comboRef.current = 0
    setCombo(0)
  }

  const round = ROUNDS[roundIndex]
  const accuracy =
    TOTAL_TARGETS > 0
      ? Math.round((totalHits / TOTAL_TARGETS) * 100)
      : 0

  return (
    <GameContainer title="BOUNTY HUNTER" onExit={onExit}>
      {!started && !result ? (
        <div className="space-y-3">
          <p className="terminal-text">
            Four rounds. Hit targets before they vanish. Speed builds each round.
          </p>
          <p className="terminal-text">
            Combo multiplies score. Misses break combo and cost a few points — keep hunting.
          </p>
          <p className="hud-label">PERSONAL BEST // {personalBest}</p>
          <PixelButton
            sfx="confirm"
            onClick={() => {
              reset()
              playUISound('gameStart', { force: true })
              setStarted(true)
            }}
          >
            START HUNT
          </PixelButton>
        </div>
      ) : null}

      {started && !result ? (
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <PixelBadge>
              ROUND {roundIndex + 1}/{ROUNDS.length}
            </PixelBadge>
            <PixelBadge>
              TARGETS {hitsInRound}/{round?.targets ?? 0}
            </PixelBadge>
            <PixelBadge>COMBO x{Math.max(1, combo || 1)}</PixelBadge>
            <PixelBadge>SCORE {score}</PixelBadge>
          </div>
          <div
            className="relative h-[280px] overflow-hidden border-2 border-[var(--pixel-border)] bg-[var(--bg-secondary)] sm:h-[340px]"
            onClick={missEmpty}
            role="presentation"
          >
            {targets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  hit(t)
                }}
                className={`absolute touch-target -translate-x-1/2 -translate-y-1/2 border-2 border-[var(--accent-dark)] bg-[var(--panel-light)] font-pixel text-[var(--highlight)] shadow-[3px_3px_0_#050607] transition-transform active:scale-95 ${SIZE_CLASS[t.size]}`}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                <span className="block text-[var(--danger)]">TARGET DETECTED</span>
                <span className="mt-1 block">{t.name}</span>
              </button>
            ))}
            {combo >= 2 ? (
              <p className="pointer-events-none absolute bottom-3 right-3 font-pixel text-[10px] text-[var(--accent)]">
                COMBO x{combo}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {result ? (
        <GameResult
          title="MISSION COMPLETE"
          achievement="CLAIMED A TARGET"
          message="All rounds cleared. Board is cold."
          score={score}
          personalBest={Math.max(personalBest, score)}
          isNewRecord={isNewRecord}
          stats={[
            { label: 'TARGETS', value: `${totalHits} / ${TOTAL_TARGETS}` },
            { label: 'ACCURACY', value: `${accuracy}%` },
            { label: 'SCORE', value: String(score) },
            { label: 'COMBO', value: `x${Math.max(1, maxCombo)}` },
          ]}
          onRetry={reset}
          onContinue={onExit}
        />
      ) : null}
    </GameContainer>
  )
}
