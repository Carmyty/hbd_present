import { useEffect, useMemo, useState } from 'react'
import { DATABASE_FILE } from '../data/database'
import { GAME_EASTER_EGGS } from '../data/anime'
import {
  buildSubjectFile,
  formatBirthdayCode,
  parseLocalDate,
} from '../data/identity'
import { GameHUD } from '../components/navigation/GameHUD'
import { ShipNavigation } from '../components/navigation/ShipNavigation'
import { PixelBadge } from '../components/ui/PixelBadge'
import { PixelDivider } from '../components/ui/PixelDivider'
import { PixelProgressBar } from '../components/ui/PixelProgressBar'
import { PixelWindow } from '../components/ui/PixelWindow'
import { useProgress } from '../hooks/useProgress'

export function Database() {
  const { progress, markDatabaseVisited, visitLocation } = useProgress()
  const [dwell, setDwell] = useState(false)

  const subject = useMemo(() => {
    const identity = progress.identity
    if (!identity) {
      return { file: 'SUBJECT_00', age: 0, birthday: '--.--' }
    }
    const parsed = parseLocalDate(identity.birthDate)
    return {
      file: buildSubjectFile(identity.name, identity.age),
      age: identity.age,
      birthday: parsed ? formatBirthdayCode(parsed) : '--.--',
    }
  }, [progress.identity])

  useEffect(() => {
    visitLocation('database')
    markDatabaseVisited()
  }, [markDatabaseVisited, visitLocation])

  useEffect(() => {
    const id = window.setTimeout(() => setDwell(true), 20000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="screen-frame pb-24 md:pb-8">
      <GameHUD locationLabel="DATABASE" showBack />
      <ShipNavigation current="database" compact />

      <PixelWindow
        title="BOUNTY NETWORK DATABASE"
        actions={<PixelBadge>FILE OPEN</PixelBadge>}
      >
        <div className="grid gap-2 font-terminal text-xl sm:grid-cols-2">
          <p>
            FILE: <span className="text-[var(--highlight)]">{subject.file}</span>
          </p>
          <p>
            AGE: <span className="text-[var(--highlight)]">{subject.age}</span>
          </p>
          <p>
            BIRTHDAY:{' '}
            <span className="text-[var(--highlight)]">{subject.birthday}</span>
          </p>
          <p>
            FIRST CONTACT:{' '}
            <span className="text-[var(--highlight)]">{DATABASE_FILE.firstContact}</span>
          </p>
          <p>
            CLASSIFICATION:{' '}
            <span className="text-[var(--success)]">{DATABASE_FILE.classification}</span>
          </p>
        </div>

        <div className="mt-4">
          <p className="hud-label mb-2">THREAT LEVEL</p>
          <PixelProgressBar
            value={DATABASE_FILE.threatLevel}
            max={100}
            showText={false}
          />
          <p className="mt-1 font-pixel text-[8px] text-[var(--text-muted)]">
            MOSTLY HARMLESS // OCCASIONALLY CHAOTIC
          </p>
        </div>

        <PixelDivider className="my-4" />

        <p className="font-pixel text-[9px] text-[var(--accent)]">KNOWN ACTIVITIES</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {DATABASE_FILE.knownActivities.map((item) => (
            <li key={item} className="terminal-text">
              - {item}
            </li>
          ))}
        </ul>

        <PixelDivider className="my-4" />

        <p className="font-pixel text-[9px] text-[var(--accent)]">FIELD NOTES</p>
        <div className="mt-2 space-y-2">
          {DATABASE_FILE.notes.map((note) => (
            <p key={note} className="terminal-text text-lg">
              &gt; {note}
            </p>
          ))}
        </div>

        <div className="mt-4 space-y-1">
          {DATABASE_FILE.easterLines.map((line) => (
            <p key={line} className="hud-label">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-4 terminal-text text-base text-[var(--text-muted)]">
          {GAME_EASTER_EGGS[2]}
        </p>

        {dwell ? (
          <p className="mt-4 font-pixel text-[8px] text-[var(--accent)] blink">
            Still reading?
          </p>
        ) : null}
      </PixelWindow>
    </div>
  )
}
