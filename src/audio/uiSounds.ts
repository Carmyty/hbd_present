/** Typed UI sound identifiers for the centralized SFX system. */
export type UISoundId =
  | 'click'
  | 'hover'
  | 'navigate'
  | 'back'
  | 'confirm'
  | 'denied'
  | 'error'
  | 'unlock'
  | 'achievement'
  | 'notification'
  | 'gameStart'
  | 'gameOver'
  | 'gameSuccess'
  | 'signalLock'
  | 'stationChange'
  | 'terminalType'

export const UI_SOUND_FILES: Record<UISoundId, string> = {
  click: '/audio/ui-click.mp3',
  hover: '/audio/ui-hover.mp3',
  navigate: '/audio/ui-navigate.mp3',
  back: '/audio/ui-back.mp3',
  confirm: '/audio/ui-confirm.mp3',
  denied: '/audio/ui-denied.mp3',
  error: '/audio/ui-error.mp3',
  unlock: '/audio/ui-unlock.mp3',
  achievement: '/audio/ui-achievement.mp3',
  notification: '/audio/ui-notification.mp3',
  gameStart: '/audio/ui-game-start.mp3',
  gameOver: '/audio/ui-game-over.mp3',
  gameSuccess: '/audio/ui-game-success.mp3',
  signalLock: '/audio/ui-signal-lock.mp3',
  stationChange: '/audio/ui-station-change.mp3',
  terminalType: '/audio/ui-terminal-type.mp3',
}

/** Relative volumes — UI should stay under radio music. */
export const UI_SOUND_VOLUME: Record<UISoundId, number> = {
  click: 0.25,
  hover: 0.12,
  navigate: 0.22,
  back: 0.24,
  confirm: 0.3,
  denied: 0.28,
  error: 0.28,
  unlock: 0.38,
  achievement: 0.4,
  notification: 0.18,
  gameStart: 0.35,
  gameOver: 0.35,
  gameSuccess: 0.4,
  signalLock: 0.42,
  stationChange: 0.28,
  terminalType: 0.1,
}

/** Cooldown for rapid-fire prevention (ms). Important cues have none. */
export const UI_SOUND_COOLDOWN_MS: Partial<Record<UISoundId, number>> = {
  click: 60,
  hover: 120,
  navigate: 80,
  back: 80,
  confirm: 80,
  denied: 400,
  error: 200,
  notification: 150,
  stationChange: 100,
  terminalType: 80,
}

const POOL_SIZE = 3

export function canUseHoverSound(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  } catch {
    return false
  }
}

/**
 * Lightweight pooled HTMLAudio player for UI SFX.
 * Missing files are tracked and silently ignored.
 */
export class UISoundEngine {
  private pools = new Map<UISoundId, HTMLAudioElement[]>()
  private missing = new Set<UISoundId>()
  private ready = new Set<UISoundId>()
  private lastPlayed = new Map<UISoundId, number>()
  private unlocked = false

  markUserInteracted() {
    this.unlocked = true
  }

  get hasUserInteracted() {
    return this.unlocked
  }

  isReady(id: UISoundId) {
    return this.ready.has(id)
  }

  /** Probe once; if the file 404s or errors, never retry. */
  private ensurePool(id: UISoundId): HTMLAudioElement[] | null {
    if (this.missing.has(id)) return null

    let pool = this.pools.get(id)
    if (pool) return pool

    const src = UI_SOUND_FILES[id]
    pool = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = new Audio(src)
      el.preload = 'auto'
      el.addEventListener('error', () => {
        this.missing.add(id)
        this.ready.delete(id)
        this.pools.delete(id)
      })
      el.addEventListener(
        'canplaythrough',
        () => {
          this.ready.add(id)
        },
        { once: true },
      )
      // Kick the network request early so 404s register before first play
      try {
        el.load()
      } catch {
        // ignore
      }
      pool.push(el)
    }
    this.pools.set(id, pool)
    return pool
  }

  play(id: UISoundId, opts?: { force?: boolean }): boolean {
    if (!this.unlocked) return false
    if (this.missing.has(id)) return false

    const now = performance.now()
    if (!opts?.force) {
      const cooldown = UI_SOUND_COOLDOWN_MS[id]
      if (typeof cooldown === 'number') {
        const last = this.lastPlayed.get(id) ?? 0
        if (now - last < cooldown) return false
      }
    }

    const pool = this.ensurePool(id)
    if (!pool || this.missing.has(id)) return false

    // File not confirmed yet — caller may fall back (e.g. click oscillator)
    if (!this.ready.has(id)) {
      this.lastPlayed.set(id, now)
      return false
    }

    const volume = UI_SOUND_VOLUME[id]
    const available =
      pool.find((a) => a.paused || a.ended) ??
      pool.reduce((best, a) => (a.currentTime > best.currentTime ? a : best))

    try {
      available.pause()
      available.currentTime = 0
      available.volume = volume
      const playPromise = available.play()
      this.lastPlayed.set(id, now)
      if (playPromise) {
        void playPromise.catch(() => {
          // Autoplay policy or missing file — stay quiet.
          if (available.error) this.missing.add(id)
        })
      }
      return true
    } catch {
      return false
    }
  }

  isMissing(id: UISoundId) {
    return this.missing.has(id)
  }
}
