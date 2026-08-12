/** Calendar gate: month/day compared to this unlock window. */
export const GATE_MONTH = 8
export const GATE_DAY = 14

export type ExperienceMode = 'birthday' | 'memories'

export type GateResult =
  | { status: 'denied'; reason: string }
  | { status: 'ok'; mode: ExperienceMode; age: number }

export interface UserIdentity {
  name: string
  /** Local calendar date as YYYY-MM-DD */
  birthDate: string
  age: number
  mode: ExperienceMode
}

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC shift). */
export function parseLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function calculateAge(birthDate: Date, now = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDelta = now.getMonth() - birthDate.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return Math.max(0, age)
}

/**
 * Before the gate day → blocked.
 * Exact gate day → full birthday experience.
 * After the gate day → memories / archive experience.
 */
export function resolveGate(birthDate: Date, now = new Date()): GateResult {
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  const beforeGate =
    month < GATE_MONTH || (month === GATE_MONTH && day < GATE_DAY)

  if (beforeGate) {
    return {
      status: 'denied',
      reason: 'ACCESS WINDOW LOCKED // SUBJECT SIGNAL NOT IN RANGE',
    }
  }

  const age = calculateAge(birthDate, now)

  if (month === GATE_MONTH && day === GATE_DAY) {
    return { status: 'ok', mode: 'birthday', age }
  }

  return { status: 'ok', mode: 'memories', age }
}

export function formatBirthdayCode(birthDate: Date): string {
  const mm = String(birthDate.getMonth() + 1).padStart(2, '0')
  const dd = String(birthDate.getDate()).padStart(2, '0')
  return `${mm}.${dd}`
}

export function buildSubjectFile(name: string, age: number): string {
  const slug =
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 16) || 'SUBJECT'
  return `${slug}_${age}`
}

export function displayName(identity: UserIdentity | null | undefined): string {
  return identity?.name?.trim() || 'CREW'
}

export function displayNameUpper(identity: UserIdentity | null | undefined): string {
  return displayName(identity).toUpperCase()
}
