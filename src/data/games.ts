import type { GameMeta } from '../types'

export const ARCADE_GAMES: GameMeta[] = [
  {
    id: 'hostile-sector',
    title: 'HOSTILE SECTOR',
    subtitle: 'SURVIVAL PROTOCOL',
    description: 'New pilot detected. Survival probability questionable.',
    difficulty: '5/10',
    achievementId: 'survived-hostile-sector',
  },
  {
    id: 'bounty-hunter',
    title: 'BOUNTY HUNTER',
    description:
      'Four rounds. Hit targets before they vanish. Misses cost score — not the mission.',
    difficulty: '5/10',
    achievementId: 'claimed-target',
  },
  {
    id: 'signal-decoder',
    title: 'SIGNAL DECODER',
    description:
      'Tune the horizontal frequency bar and lock onto the signal. Three rounds.',
    difficulty: '5/10',
    achievementId: 'decoded-signal',
  },
]
