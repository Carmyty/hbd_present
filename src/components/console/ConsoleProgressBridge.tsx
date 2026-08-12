import { useEffect, useRef } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useConsole } from '../../hooks/useConsole'
import { NORMAL_STATION_ORDER } from '../../data/progressLogic'

/**
 * Watches progress milestones and emits priority console comments
 * without coupling ProgressContext to the console system.
 */
export function ConsoleProgressBridge() {
  const { progress } = useProgress()
  const { say } = useConsole()

  const prevStations = useRef(progress.unlockedStations.join(','))
  const prevSecret = useRef(progress.secretSignalUnlocked)
  const ready = useRef(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      ready.current = true
    }, 800)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!ready.current) {
      prevStations.current = progress.unlockedStations.join(',')
      return
    }

    const key = progress.unlockedStations.join(',')
    if (key === prevStations.current) return

    const prev = new Set(prevStations.current.split(',').filter(Boolean))
    prevStations.current = key

    for (const station of NORMAL_STATION_ORDER) {
      if (station === 'bebop') continue
      if (progress.unlockedStations.includes(station) && !prev.has(station)) {
        say('stationUnlock', { force: true })
        break
      }
    }
  }, [progress.unlockedStations, say])

  useEffect(() => {
    if (!ready.current) {
      prevSecret.current = progress.secretSignalUnlocked
      return
    }
    if (progress.secretSignalUnlocked && !prevSecret.current) {
      say('secretUnlock', { force: true })
      window.setTimeout(() => {
        say('finalTransmission', { force: true })
      }, 2200)
    }
    prevSecret.current = progress.secretSignalUnlocked
  }, [progress.secretSignalUnlocked, say])

  return null
}
