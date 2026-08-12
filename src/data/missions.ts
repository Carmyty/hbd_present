import { isMissionComplete } from './progressLogic'
import type { ExperienceMode } from './identity'
import type { AchievementId, ProgressState } from '../types'

export interface MissionObjective {
  id: string
  label: string
  achievementId?: AchievementId
  check: (state: ProgressState) => boolean
}

export function getMission(mode: ExperienceMode = 'birthday') {
  if (mode === 'memories') {
    return {
      title: 'THE LOST ARCHIVE',
      code: 'BB-MEM',
      description:
        'The birthday window closed, but the transmissions remain. Recover the memory signal.',
      reward: 'CLASSIFIED',
    }
  }

  return {
    title: 'THE LOST BIRTHDAY',
    code: 'BB-DAY',
    description:
      'Something has gone wrong. Your birthday has been classified as missing. Recover the signal.',
    reward: 'CLASSIFIED',
  }
}

/** @deprecated Prefer getMission(mode) */
export const MISSION = getMission('birthday')

export const MISSION_OBJECTIVES: MissionObjective[] = [
  {
    id: 'accept',
    label: 'Accept bounty',
    achievementId: 'accepted-bounty',
    check: (s) => s.acceptedBounty,
  },
  {
    id: 'hostile-sector',
    label: 'Survive Hostile Sector',
    achievementId: 'survived-hostile-sector',
    check: (s) => s.completedGames.includes('hostile-sector'),
  },
  {
    id: 'target',
    label: 'Claim target',
    achievementId: 'claimed-target',
    check: (s) => s.completedGames.includes('bounty-hunter'),
  },
  {
    id: 'decode',
    label: 'Decode the signal',
    achievementId: 'decoded-signal',
    check: (s) => s.completedGames.includes('signal-decoder'),
  },
  {
    id: 'radio',
    label: 'Tune the radio',
    achievementId: 'found-radio',
    check: (s) => s.unlockedAchievements.includes('found-radio'),
  },
  {
    id: 'database',
    label: 'Decrypt database',
    achievementId: 'decrypted-database',
    check: (s) => s.unlockedAchievements.includes('decrypted-database'),
  },
  {
    id: 'secret',
    label: 'Find secret signal',
    achievementId: 'found-secret-signal',
    check: (s) =>
      s.secretSignalUnlocked &&
      s.unlockedAchievements.includes('found-secret-signal'),
  },
  {
    id: 'complete',
    label: 'Complete final transmission',
    achievementId: 'completed-birthday-bounty',
    check: (s) => s.finalMissionComplete,
  },
]

export function areAllObjectivesComplete(state: ProgressState): boolean {
  return MISSION_OBJECTIVES.every((o) => o.check(state)) && isMissionComplete(state)
}
