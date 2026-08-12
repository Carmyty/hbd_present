export type ConsoleMessageContext =
  | 'locked'
  | 'lockedRepeat'
  | 'rapidClicks'
  | 'sameButton'
  | 'gameFailure'
  | 'gameSuccess'
  | 'gameCloseCall'
  | 'radioDiscovery'
  | 'stationUnlock'
  | 'signalDecoder'
  | 'bountyHunter'
  | 'hostileSector'
  | 'idle'
  | 'finalTransmission'
  | 'secretUnlock'
  | 'competent'
  | 'navigation'

export const CONSOLE_MESSAGES: Record<ConsoleMessageContext, string[]> = {
  locked: [
    'Access denied.',
    'That channel is locked.',
    'Yes, it is still locked.',
  ],
  lockedRepeat: [
    'You have already been informed.',
    'Stop pressing the locked channel.',
    'Locked means locked.',
    'Persistence will not decrypt this.',
  ],
  rapidClicks: [
    'Stop pressing random buttons.',
    'Please stop testing the buttons.',
    'Navigation is not improved by clicking faster.',
    'Calm down, bounty hunter.',
    'I admire your commitment to pressing things.',
  ],
  sameButton: [
    'That button has not changed.',
    'You have successfully pressed the same button three times.',
    'That button does exactly what it says.',
    'Input received. Regrettably.',
  ],
  gameFailure: [
    'That could have gone better.',
    'Recalibration recommended.',
    'Perhaps try surviving next time.',
    'System approval: 12%.',
    'Pilot competence not detected.',
  ],
  gameSuccess: [
    'Objective complete.',
    'Acceptable performance.',
    'Pilot competence confirmed.',
    'Unexpectedly competent.',
    'Acceptable.',
    'Not bad.',
    'System approval: 62%.',
  ],
  gameCloseCall: [
    'That was close.',
    'If that was intentional, impressive.',
    'Your survival instincts appear functional.',
    'Perhaps try dodging.',
  ],
  radioDiscovery: [
    'Transmission archived.',
    'Signal logged.',
    'Transmission discovered.',
  ],
  stationUnlock: [
    'Frequency catalogued.',
    'Next channel available.',
    'Mission parameters updated.',
  ],
  signalDecoder: [
    'Signal detected.',
    'Signal lost.',
    "You're getting warmer.",
    'Wrong direction.',
    'Almost.',
    'Stop chasing the signal.',
    'The signal is not going to chase you.',
    'Frequency adjustment required.',
  ],
  bountyHunter: [
    'Target acquired. Somehow.',
    'Please remember that enemies are not decorative.',
    'Interesting choice.',
  ],
  hostileSector: [
    'Running directly into the enemy remains suboptimal.',
    'Perhaps try dodging.',
    'Hull integrity is not infinite.',
  ],
  idle: [
    'System is still waiting for a valid input.',
    'System has no comment.',
    'System absolutely has a comment.',
    'Are you sure you know what you\'re doing?',
  ],
  finalTransmission: [
    'Something is transmitting.',
    'This signal was not in the database.',
    'Unknown source detected.',
    'Encryption has failed.',
    'Or rather, you succeeded.',
  ],
  secretUnlock: [
    'Something is transmitting.',
    'Unknown source detected.',
    'This signal was not in the database.',
    'Encryption has failed.',
    'Or rather, you succeeded.',
  ],
  competent: [
    'That was surprisingly competent.',
    'Acceptable.',
    'Not bad.',
    'Congratulations. You found the correct button.',
  ],
  navigation: [
    'New objective detected.',
    'Mission parameters updated.',
    'Pilot confidence detected.',
  ],
}

/** Events that may bypass the normal comment cooldown. */
export const CONSOLE_PRIORITY_CONTEXTS: ConsoleMessageContext[] = [
  'radioDiscovery',
  'stationUnlock',
  'gameSuccess',
  'secretUnlock',
  'finalTransmission',
]

export function pickConsoleMessage(
  context: ConsoleMessageContext,
  avoid?: string | null,
): string {
  const pool = CONSOLE_MESSAGES[context]
  if (pool.length === 0) return 'System has no comment.'
  if (pool.length === 1) return pool[0]

  let choice = pool[Math.floor(Math.random() * pool.length)]
  if (avoid && pool.length > 1) {
    let attempts = 0
    while (choice === avoid && attempts < 6) {
      choice = pool[Math.floor(Math.random() * pool.length)]
      attempts += 1
    }
  }
  return choice
}
