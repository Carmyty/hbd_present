import type {
  AchievementId,
  ProgressState,
  RadioProgress,
  RadioProgressKey,
  StationId,
  TrackCompletionFlags,
} from '../types'

export const EMPTY_TRACK_FLAGS: TrackCompletionFlags = [false, false, false, false]

export const DEFAULT_RADIO_PROGRESS: RadioProgress = {
  bebop: [...EMPTY_TRACK_FLAGS] as TrackCompletionFlags,
  static: [...EMPTY_TRACK_FLAGS] as TrackCompletionFlags,
  anime: [...EMPTY_TRACK_FLAGS] as TrackCompletionFlags,
  lateNight: [...EMPTY_TRACK_FLAGS] as TrackCompletionFlags,
}

/** Quests required before LAST TRANSMISSION can unlock (excludes secret + final). */
export const REQUIRED_QUESTS_FOR_SECRET: AchievementId[] = [
  'accepted-bounty',
  'survived-hostile-sector',
  'claimed-target',
  'decoded-signal',
  'found-radio',
  'decrypted-database',
]

export const NORMAL_STATION_ORDER: Exclude<StationId, 'last-transmission'>[] = [
  'bebop',
  'static',
  'anime',
  'late-night',
]

export const STATION_PROGRESS_KEY: Record<
  Exclude<StationId, 'last-transmission'>,
  RadioProgressKey
> = {
  bebop: 'bebop',
  static: 'static',
  anime: 'anime',
  'late-night': 'lateNight',
}

export const NEXT_STATION: Partial<
  Record<Exclude<StationId, 'last-transmission'>, Exclude<StationId, 'last-transmission'>>
> = {
  bebop: 'static',
  static: 'anime',
  anime: 'late-night',
}

export const STATION_UNLOCK_REQUIREMENT: Partial<
  Record<StationId, { channel: string; name: string }>
> = {
  static: { channel: 'CHANNEL 01', name: 'BEBOP' },
  anime: { channel: 'CHANNEL 02', name: 'STATIC' },
  'late-night': { channel: 'CHANNEL 03', name: 'ANIME SIGNAL' },
  'last-transmission': { channel: 'ALL QUESTS + CHANNEL 04', name: 'LATE NIGHT' },
}

export function isStationTracksComplete(
  progress: RadioProgress,
  stationId: Exclude<StationId, 'last-transmission'>,
): boolean {
  const key = STATION_PROGRESS_KEY[stationId]
  return progress[key].every(Boolean)
}

export function allRequiredQuestsCompleted(state: ProgressState): boolean {
  return REQUIRED_QUESTS_FOR_SECRET.every((id) =>
    state.unlockedAchievements.includes(id),
  )
}

export function canUnlockLastTransmission(state: ProgressState): boolean {
  return (
    allRequiredQuestsCompleted(state) &&
    isStationTracksComplete(state.radioProgress, 'late-night')
  )
}

/** Single source of truth: every required objective is done. */
export function isMissionComplete(state: ProgressState): boolean {
  return (
    state.acceptedBounty &&
    state.completedGames.includes('hostile-sector') &&
    state.completedGames.includes('bounty-hunter') &&
    state.completedGames.includes('signal-decoder') &&
    state.unlockedAchievements.includes('found-radio') &&
    state.unlockedAchievements.includes('decrypted-database') &&
    state.secretSignalFound &&
    state.finalMissionComplete
  )
}

export function canAccessBirthday(state: ProgressState): boolean {
  if (state.finalMissionComplete && state.secretSignalFound) return true
  return (
    state.secretSignalUnlocked &&
    state.secretSignalFound &&
    allRequiredQuestsCompleted(state) &&
    isStationTracksComplete(state.radioProgress, 'late-night')
  )
}

export function deriveUnlockedStations(state: ProgressState): StationId[] {
  const unlocked: StationId[] = ['bebop']
  if (isStationTracksComplete(state.radioProgress, 'bebop')) unlocked.push('static')
  if (isStationTracksComplete(state.radioProgress, 'static')) unlocked.push('anime')
  if (isStationTracksComplete(state.radioProgress, 'anime')) unlocked.push('late-night')
  if (state.secretSignalUnlocked) unlocked.push('last-transmission')
  return unlocked
}

export function stationDisplayName(id: StationId): string {
  const names: Record<StationId, string> = {
    bebop: 'BEBOP',
    static: 'STATIC',
    anime: 'ANIME SIGNAL',
    'late-night': 'LATE NIGHT',
    'last-transmission': 'LAST TRANSMISSION',
  }
  return names[id]
}

export function stationChannelLabel(id: StationId): string {
  const labels: Record<StationId, string> = {
    bebop: 'CHANNEL 01',
    static: 'CHANNEL 02',
    anime: 'CHANNEL 03',
    'late-night': 'CHANNEL 04',
    'last-transmission': 'CHANNEL ???',
  }
  return labels[id]
}
