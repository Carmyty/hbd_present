import type { Achievement, AchievementId } from '../types'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'accepted-bounty',
    title: 'ACCEPTED THE BOUNTY',
    description: 'Connected to the Bounty Network and accepted the mission.',
  },
  {
    id: 'survived-hostile-sector',
    title: 'SURVIVED HOSTILE SECTOR',
    description: 'Survived 30 seconds under escalating enemy pressure.',
  },
  {
    id: 'claimed-target',
    title: 'CLAIMED A TARGET',
    description: 'Cleared every round of Bounty Hunter.',
  },
  {
    id: 'decoded-signal',
    title: 'DECODED THE SIGNAL',
    description: 'Locked onto all three encrypted frequencies.',
  },
  {
    id: 'found-radio',
    title: 'FOUND THE RADIO',
    description: 'Tuned into Space Radio 88.7.',
  },
  {
    id: 'decrypted-database',
    title: 'DECRYPTED THE DATABASE',
    description: 'Opened the subject file in the bounty database.',
  },
  {
    id: 'found-secret-signal',
    title: 'FOUND THE SECRET SIGNAL',
    description: 'Unlocked LAST TRANSMISSION through full objective clearance.',
  },
  {
    id: 'completed-birthday-bounty',
    title: 'COMPLETED THE FINAL TRANSMISSION',
    description: 'Reached the end of the recovered signal.',
  },
]

export const ACHIEVEMENT_MAP: Record<AchievementId, Achievement> = ACHIEVEMENTS.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<AchievementId, Achievement>,
)

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length
