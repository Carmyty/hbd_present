import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ACHIEVEMENT_MAP, TOTAL_ACHIEVEMENTS } from '../data/achievements'
import {
  canUnlockLastTransmission,
  deriveUnlockedStations,
  isStationTracksComplete,
  NEXT_STATION,
  stationChannelLabel,
  stationDisplayName,
  STATION_PROGRESS_KEY,
} from '../data/progressLogic'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { UserIdentity } from '../data/identity'
import type {
  AchievementId,
  GameId,
  ProgressState,
  RadioProgress,
  ShipLocation,
  StationId,
  ToastPayload,
  TrackCompletionFlags,
} from '../types'

const STORAGE_KEY = 'birthday-bounty-progress-v3'
const LEGACY_KEYS = [
  'birthday-bounty-progress-v2',
  'birthday-bounty-progress-v1',
] as const

function createDefaultRadioProgress(): RadioProgress {
  return {
    bebop: [false, false, false, false],
    static: [false, false, false, false],
    anime: [false, false, false, false],
    lateNight: [false, false, false, false],
  }
}

function createDefaultProgress(): ProgressState {
  return {
    identity: null,
    bootComplete: false,
    acceptedBounty: false,
    completedGames: [],
    unlockedAchievements: [],
    unlockedStations: ['bebop'],
    radioProgress: createDefaultRadioProgress(),
    visitedLocations: [],
    secretSignalUnlocked: false,
    secretSignalFound: false,
    finalMissionComplete: false,
    rewardClaimed: false,
    highScores: {},
    easterEggCounts: {},
  }
}

function normalizeIdentity(raw: unknown): UserIdentity | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Partial<UserIdentity>
  if (
    typeof obj.name !== 'string' ||
    !obj.name.trim() ||
    typeof obj.birthDate !== 'string' ||
    typeof obj.age !== 'number' ||
    (obj.mode !== 'birthday' && obj.mode !== 'memories')
  ) {
    return null
  }
  return {
    name: obj.name.trim().slice(0, 24),
    birthDate: obj.birthDate,
    age: Math.max(0, Math.floor(obj.age)),
    mode: obj.mode,
  }
}

interface ProgressContextValue {
  progress: ProgressState
  toast: ToastPayload | null
  clearToast: () => void
  achievementCount: number
  totalAchievements: number
  registerIdentity: (identity: UserIdentity) => void
  completeBoot: () => void
  acceptBounty: () => void
  visitLocation: (location: ShipLocation) => void
  completeGame: (gameId: GameId, score?: number) => void
  unlockAchievement: (id: AchievementId) => void
  markRadioVisited: () => void
  markDatabaseVisited: () => void
  completeRadioTrack: (
    stationId: StationId,
    trackIndex: number,
    trackTitle?: string,
  ) => void
  unlockSecretSignal: () => void
  findSecretSignal: () => void
  completeFinalMission: () => void
  claimReward: () => void
  bumpEasterEgg: (key: string) => number
  isStationUnlocked: (id: StationId) => boolean
  isRadioStationComplete: (id: Exclude<StationId, 'last-transmission'>) => boolean
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function withUnique<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list : [...list, item]
}

function migrateAchievementId(id: string): AchievementId | null {
  const map: Record<string, AchievementId> = {
    'accepted-bounty': 'accepted-bounty',
    'survived-terraria': 'survived-hostile-sector',
    'survived-hostile-sector': 'survived-hostile-sector',
    'claimed-target': 'claimed-target',
    'power-scanned': 'decoded-signal',
    'decoded-signal': 'decoded-signal',
    'found-radio': 'found-radio',
    'decrypted-database': 'decrypted-database',
    'found-secret-signal': 'found-secret-signal',
    'completed-birthday-bounty': 'completed-birthday-bounty',
  }
  return map[id] ?? null
}

function migrateGameId(id: string): GameId | null {
  const map: Record<string, GameId> = {
    terraria: 'hostile-sector',
    'hostile-sector': 'hostile-sector',
    'bounty-hunter': 'bounty-hunter',
    'anime-scanner': 'signal-decoder',
    'signal-decoder': 'signal-decoder',
  }
  return map[id] ?? null
}

function normalizeRadioProgress(raw: unknown): RadioProgress {
  const base = createDefaultRadioProgress()
  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Partial<RadioProgress>
  for (const key of ['bebop', 'static', 'anime', 'lateNight'] as const) {
    const flags = obj[key]
    if (Array.isArray(flags) && flags.length === 4) {
      base[key] = flags.map(Boolean) as TrackCompletionFlags
    }
  }
  return base
}

function migrateProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return createDefaultProgress()

  const legacy = raw as Partial<ProgressState> & {
    unlockedAchievements?: string[]
    completedGames?: string[]
    unlockedStations?: string[]
  }

  const unlockedAchievements = (legacy.unlockedAchievements ?? [])
    .map(migrateAchievementId)
    .filter((id): id is AchievementId => id !== null)
    .reduce<AchievementId[]>((acc, id) => withUnique(acc, id), [])

  const completedGames = (legacy.completedGames ?? [])
    .map(migrateGameId)
    .filter((id): id is GameId => id !== null)
    .reduce<GameId[]>((acc, id) => withUnique(acc, id), [])

  const highScores: ProgressState['highScores'] = {}
  if (legacy.highScores) {
    for (const [key, value] of Object.entries(legacy.highScores)) {
      const gameId = migrateGameId(key)
      if (gameId && typeof value === 'number') {
        highScores[gameId] = Math.max(highScores[gameId] ?? 0, value)
      }
    }
  }

  const radioProgress = normalizeRadioProgress(legacy.radioProgress)

  const identity = normalizeIdentity(
    (legacy as Partial<ProgressState>).identity,
  )

  let state: ProgressState = {
    ...createDefaultProgress(),
    identity,
    // Identity required for a valid session — drop legacy boot without it.
    bootComplete: Boolean(legacy.bootComplete) && identity !== null,
    acceptedBounty: Boolean(legacy.acceptedBounty) && identity !== null,
    completedGames,
    unlockedAchievements,
    radioProgress,
    visitedLocations: Array.isArray(legacy.visitedLocations)
      ? (legacy.visitedLocations as ShipLocation[])
      : [],
    secretSignalUnlocked: false,
    secretSignalFound: Boolean(legacy.secretSignalFound),
    finalMissionComplete: Boolean(legacy.finalMissionComplete),
    rewardClaimed: Boolean(legacy.rewardClaimed),
    highScores,
    easterEggCounts:
      legacy.easterEggCounts && typeof legacy.easterEggCounts === 'object'
        ? legacy.easterEggCounts
        : {},
    unlockedStations: ['bebop'],
  }

  if (!identity) {
    state = createDefaultProgress()
  }

  // Re-derive station unlocks from radio progress (ignore legacy "all unlocked").
  state.unlockedStations = deriveUnlockedStations(state)

  // Re-validate secret unlock — never trust stale flags alone.
  if (canUnlockLastTransmission(state)) {
    state.secretSignalUnlocked = true
    state.unlockedStations = withUnique(state.unlockedStations, 'last-transmission')
    state.unlockedAchievements = withUnique(
      state.unlockedAchievements,
      'found-secret-signal',
    )
  } else {
    state.secretSignalUnlocked = false
    state.unlockedStations = state.unlockedStations.filter(
      (id) => id !== 'last-transmission',
    )
    // If they never truly unlocked secret, clear premature completion chain.
    if (!state.secretSignalUnlocked) {
      state.secretSignalFound = false
      state.finalMissionComplete = false
      state.rewardClaimed = false
      state.unlockedAchievements = state.unlockedAchievements.filter(
        (id) =>
          id !== 'found-secret-signal' && id !== 'completed-birthday-bounty',
      )
    }
  }

  // final mission only valid if secret was found
  if (!state.secretSignalFound) {
    state.finalMissionComplete = false
    state.unlockedAchievements = state.unlockedAchievements.filter(
      (id) => id !== 'completed-birthday-bounty',
    )
  }

  return state
}

function readInitialProgress(): ProgressState {
  try {
    const current = window.localStorage.getItem(STORAGE_KEY)
    if (current) return migrateProgress(JSON.parse(current))
    for (const key of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(key)
      if (legacy) return migrateProgress(JSON.parse(legacy))
    }
  } catch {
    // fall through
  }
  return createDefaultProgress()
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useLocalStorage<ProgressState>(
    STORAGE_KEY,
    readInitialProgress(),
  )
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const migratedRef = useRef(false)

  // Normalize / migrate stored progress once on mount
  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    setProgress((prev) => migrateProgress(prev))
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        for (const key of LEGACY_KEYS) {
          const legacy = window.localStorage.getItem(key)
          if (legacy) {
            setProgress(migrateProgress(JSON.parse(legacy)))
            break
          }
        }
      }
    } catch {
      // ignore
    }
  }, [setProgress])

  const pushToast = useCallback((title: string, description: string) => {
    setToast({
      id: `${title}-${Date.now()}`,
      title,
      description,
    })
  }, [])

  const pushAchievement = useCallback(
    (prev: ProgressState, id: AchievementId): ProgressState => {
      if (prev.unlockedAchievements.includes(id)) return prev
      const achievement = ACHIEVEMENT_MAP[id]
      pushToast('ACHIEVEMENT UNLOCKED', achievement.title)
      return {
        ...prev,
        unlockedAchievements: withUnique(prev.unlockedAchievements, id),
      }
    },
    [pushToast],
  )

  const maybeUnlockSecret = useCallback(
    (prev: ProgressState): ProgressState => {
      if (prev.secretSignalUnlocked) return prev
      if (!canUnlockLastTransmission(prev)) return prev
      let next: ProgressState = {
        ...prev,
        secretSignalUnlocked: true,
        unlockedStations: withUnique(prev.unlockedStations, 'last-transmission'),
      }
      next = pushAchievement(next, 'found-secret-signal')
      pushToast('CHANNEL ??? UNLOCKED', 'LAST TRANSMISSION')
      return next
    },
    [pushAchievement, pushToast],
  )

  // Keep secret unlock in sync when prerequisites become true
  useEffect(() => {
    setProgress((prev) => {
      if (prev.secretSignalUnlocked) {
        if (!canUnlockLastTransmission(prev)) {
          // Conditions no longer met (shouldn't happen mid-play) — do not revoke mid-session
          return prev
        }
        if (!prev.unlockedStations.includes('last-transmission')) {
          return {
            ...prev,
            unlockedStations: withUnique(prev.unlockedStations, 'last-transmission'),
          }
        }
        return prev
      }
      return maybeUnlockSecret(prev)
    })
  }, [
    progress.unlockedAchievements,
    progress.radioProgress,
    progress.secretSignalUnlocked,
    maybeUnlockSecret,
    setProgress,
  ])

  const unlockAchievement = useCallback(
    (id: AchievementId) => {
      setProgress((prev) => maybeUnlockSecret(pushAchievement(prev, id)))
    },
    [maybeUnlockSecret, pushAchievement, setProgress],
  )

  const registerIdentity = useCallback(
    (identity: UserIdentity) => {
      setProgress((prev) => ({
        ...prev,
        identity: {
          name: identity.name.trim().slice(0, 24),
          birthDate: identity.birthDate,
          age: Math.max(0, Math.floor(identity.age)),
          mode: identity.mode,
        },
      }))
    },
    [setProgress],
  )

  const completeBoot = useCallback(() => {
    setProgress((prev) => {
      if (!prev.identity) return prev
      return { ...prev, bootComplete: true }
    })
  }, [setProgress])

  const acceptBounty = useCallback(() => {
    setProgress((prev) => {
      let next: ProgressState = { ...prev, acceptedBounty: true }
      next = pushAchievement(next, 'accepted-bounty')
      return maybeUnlockSecret(next)
    })
  }, [maybeUnlockSecret, pushAchievement, setProgress])

  const visitLocation = useCallback(
    (location: ShipLocation) => {
      setProgress((prev) => ({
        ...prev,
        visitedLocations: withUnique(prev.visitedLocations, location),
      }))
    },
    [setProgress],
  )

  const completeGame = useCallback(
    (gameId: GameId, score = 0) => {
      setProgress((prev) => {
        let next: ProgressState = {
          ...prev,
          completedGames: withUnique(prev.completedGames, gameId),
          highScores: {
            ...prev.highScores,
            [gameId]: Math.max(prev.highScores[gameId] ?? 0, score),
          },
        }
        const map: Record<GameId, AchievementId> = {
          'hostile-sector': 'survived-hostile-sector',
          'bounty-hunter': 'claimed-target',
          'signal-decoder': 'decoded-signal',
        }
        next = pushAchievement(next, map[gameId])
        return maybeUnlockSecret(next)
      })
    },
    [maybeUnlockSecret, pushAchievement, setProgress],
  )

  const markRadioVisited = useCallback(() => {
    setProgress((prev) => maybeUnlockSecret(pushAchievement(prev, 'found-radio')))
  }, [maybeUnlockSecret, pushAchievement, setProgress])

  const markDatabaseVisited = useCallback(() => {
    setProgress((prev) =>
      maybeUnlockSecret(pushAchievement(prev, 'decrypted-database')),
    )
  }, [maybeUnlockSecret, pushAchievement, setProgress])

  const completeRadioTrack = useCallback(
    (stationId: StationId, trackIndex: number, trackTitle?: string) => {
      if (stationId === 'last-transmission') return
      if (trackIndex < 0 || trackIndex > 3) return

      let discoveredTitle: string | null = null
      let completedNext: Exclude<StationId, 'last-transmission'> | null = null
      let stationCompleted = false

      setProgress((prev) => {
        const key = STATION_PROGRESS_KEY[stationId]
        if (prev.radioProgress[key][trackIndex]) {
          return maybeUnlockSecret(prev)
        }

        const flags = [...prev.radioProgress[key]] as TrackCompletionFlags
        flags[trackIndex] = true
        discoveredTitle = trackTitle ?? 'SIGNAL LOGGED'

        let next: ProgressState = {
          ...prev,
          radioProgress: {
            ...prev.radioProgress,
            [key]: flags,
          },
        }

        stationCompleted = flags.every(Boolean)
        if (stationCompleted) {
          const nextStation = NEXT_STATION[stationId] ?? null
          completedNext = nextStation
          if (nextStation && !next.unlockedStations.includes(nextStation)) {
            next = {
              ...next,
              unlockedStations: withUnique(next.unlockedStations, nextStation),
            }
          }
        }

        next = {
          ...next,
          unlockedStations: deriveUnlockedStations({
            ...next,
            unlockedStations: next.unlockedStations,
          }),
        }

        return maybeUnlockSecret(next)
      })

      if (discoveredTitle) {
        pushToast('TRANSMISSION DISCOVERED', discoveredTitle)
        if (stationCompleted) {
          const nextStation = completedNext
          window.setTimeout(() => {
            pushToast(
              'CHANNEL COMPLETE',
              nextStation ? 'NEXT FREQUENCY AVAILABLE' : 'FREQUENCY CATALOGUED',
            )
          }, 900)
          if (nextStation) {
            window.setTimeout(() => {
              pushToast(
                `${stationChannelLabel(nextStation)} UNLOCKED`,
                stationDisplayName(nextStation),
              )
            }, 1800)
          }
        }
      }
    },
    [maybeUnlockSecret, pushToast, setProgress],
  )

  const unlockSecretSignal = useCallback(() => {
    setProgress((prev) => maybeUnlockSecret(prev))
  }, [maybeUnlockSecret, setProgress])

  const findSecretSignal = useCallback(() => {
    setProgress((prev) => {
      if (!prev.secretSignalUnlocked) return prev
      return { ...prev, secretSignalFound: true }
    })
  }, [setProgress])

  const completeFinalMission = useCallback(() => {
    setProgress((prev) => {
      if (!prev.secretSignalFound) return prev
      let next: ProgressState = { ...prev, finalMissionComplete: true }
      next = pushAchievement(next, 'completed-birthday-bounty')
      return next
    })
  }, [pushAchievement, setProgress])

  const claimReward = useCallback(() => {
    setProgress((prev) => {
      if (!prev.finalMissionComplete) return prev
      return { ...prev, rewardClaimed: true }
    })
  }, [setProgress])

  const bumpEasterEgg = useCallback(
    (key: string) => {
      let count = 0
      setProgress((prev) => {
        count = (prev.easterEggCounts[key] ?? 0) + 1
        return {
          ...prev,
          easterEggCounts: { ...prev.easterEggCounts, [key]: count },
        }
      })
      return count
    },
    [setProgress],
  )

  const isStationUnlocked = useCallback(
    (id: StationId) => {
      if (id === 'last-transmission') return progress.secretSignalUnlocked
      if (id === 'bebop') return true
      return progress.unlockedStations.includes(id)
    },
    [progress.secretSignalUnlocked, progress.unlockedStations],
  )

  const isRadioStationComplete = useCallback(
    (id: Exclude<StationId, 'last-transmission'>) =>
      isStationTracksComplete(progress.radioProgress, id),
    [progress.radioProgress],
  )

  const resetProgress = useCallback(() => {
    setProgress(createDefaultProgress())
    setToast(null)
    window.localStorage.removeItem('birthday-bounty-radio-unlock-seen')
    for (const key of LEGACY_KEYS) {
      window.localStorage.removeItem(key)
    }
  }, [setProgress])

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      toast,
      clearToast: () => setToast(null),
      achievementCount: progress.unlockedAchievements.length,
      totalAchievements: TOTAL_ACHIEVEMENTS,
      registerIdentity,
      completeBoot,
      acceptBounty,
      visitLocation,
      completeGame,
      unlockAchievement,
      markRadioVisited,
      markDatabaseVisited,
      completeRadioTrack,
      unlockSecretSignal,
      findSecretSignal,
      completeFinalMission,
      claimReward,
      bumpEasterEgg,
      isStationUnlocked,
      isRadioStationComplete,
      resetProgress,
    }),
    [
      progress,
      toast,
      registerIdentity,
      completeBoot,
      acceptBounty,
      visitLocation,
      completeGame,
      unlockAchievement,
      markRadioVisited,
      markDatabaseVisited,
      completeRadioTrack,
      unlockSecretSignal,
      findSecretSignal,
      completeFinalMission,
      claimReward,
      bumpEasterEgg,
      isStationUnlocked,
      isRadioStationComplete,
      resetProgress,
    ],
  )

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return ctx
}
