import type { UserIdentity } from '../data/identity'

export type ScreenId =
  | 'boot'
  | 'bounty-network'
  | 'bebop'
  | 'arcade'
  | 'radio'
  | 'database'
  | 'bounty-terminal'
  | 'secret-signal'
  | 'birthday'
  | 'reward'

export type { ExperienceMode, UserIdentity } from '../data/identity'

export type ShipLocation =
  | 'cockpit'
  | 'arcade'
  | 'radio'
  | 'database'
  | 'bounty-terminal'

export type AchievementId =
  | 'accepted-bounty'
  | 'survived-hostile-sector'
  | 'claimed-target'
  | 'decoded-signal'
  | 'found-radio'
  | 'decrypted-database'
  | 'found-secret-signal'
  | 'completed-birthday-bounty'

export type GameId = 'hostile-sector' | 'bounty-hunter' | 'signal-decoder'

export type StationId =
  | 'bebop'
  | 'static'
  | 'anime'
  | 'late-night'
  | 'last-transmission'

export type RadioProgressKey = 'bebop' | 'static' | 'anime' | 'lateNight'

export type TrackCompletionFlags = [boolean, boolean, boolean, boolean]

export interface RadioProgress {
  bebop: TrackCompletionFlags
  static: TrackCompletionFlags
  anime: TrackCompletionFlags
  lateNight: TrackCompletionFlags
}

export interface Achievement {
  id: AchievementId
  title: string
  description: string
}

export interface Track {
  id: string
  title: string
  artist: string
  src: string
}

/** @deprecated Prefer Track — kept for existing imports */
export type RadioTrack = Track

export interface RadioStation {
  id: StationId
  channel: string
  name: string
  description: string
  tracks: Track[]
  locked?: boolean
}

export interface GameMeta {
  id: GameId
  title: string
  subtitle?: string
  description: string
  difficulty: string
  achievementId: AchievementId
}

export interface ProgressState {
  identity: UserIdentity | null
  bootComplete: boolean
  acceptedBounty: boolean
  completedGames: GameId[]
  unlockedAchievements: AchievementId[]
  unlockedStations: StationId[]
  radioProgress: RadioProgress
  visitedLocations: ShipLocation[]
  secretSignalUnlocked: boolean
  secretSignalFound: boolean
  finalMissionComplete: boolean
  rewardClaimed: boolean
  highScores: Partial<Record<GameId, number>>
  easterEggCounts: Record<string, number>
}

export interface AudioPrefs {
  enabled: boolean
  muted: boolean
  volume: number
  lastStationId: StationId
  /** Independent of music — defaults true. */
  uiSoundsEnabled: boolean
}

export type ToastPayload = {
  id: string
  title: string
  description: string
}
