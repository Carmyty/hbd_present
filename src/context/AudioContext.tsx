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
import {
  DEFAULT_STATION,
  getStation,
  normalizeStationId,
  RADIO_STATIONS,
} from '../data/radio'
import { STATION_PROGRESS_KEY } from '../data/progressLogic'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProgressContext } from './ProgressContext'
import { useConsoleContext } from './ConsoleContext'
import type { AudioPrefs, RadioTrack, StationId } from '../types'
import { UISoundEngine, type UISoundId } from '../audio/uiSounds'

const STORAGE_KEY = 'birthday-bounty-audio-v1'

const DEFAULT_PREFS: AudioPrefs = {
  enabled: false,
  muted: false,
  volume: 0.55,
  lastStationId: DEFAULT_STATION,
  uiSoundsEnabled: true,
}

interface AudioContextValue {
  prefs: AudioPrefs
  currentStationId: StationId
  currentTrackIndex: number
  currentTrack: RadioTrack | null
  trackCount: number
  isPlaying: boolean
  signalLost: boolean
  /** Elapsed playback position in seconds for the current track. */
  currentTime: number
  /** Total track duration in seconds (0 until metadata loads). */
  duration: number
  setEnabled: (enabled: boolean) => void
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
  setUiSoundsEnabled: (enabled: boolean) => void
  /** Stop music and disable radio playback (e.g. after progress reset). */
  stopRadio: () => void
  selectStation: (id: StationId) => void
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  nextTrack: () => void
  prevTrack: () => void
  playUISound: (id: UISoundId, opts?: { force?: boolean }) => void
  /** @deprecated Prefer playUISound — kept for existing call sites. */
  playSfx: (name: SfxName) => void
}

/** Legacy SFX names mapped onto the UI sound system. */
export type SfxName =
  | 'click'
  | 'beep'
  | 'achievement'
  | 'error'
  | 'static'
  | 'unlock'

export type { UISoundId }

const SFX_TO_UI: Record<SfxName, UISoundId> = {
  click: 'click',
  beep: 'navigate',
  achievement: 'achievement',
  error: 'error',
  static: 'notification',
  unlock: 'unlock',
}

const AudioReactContext = createContext<AudioContextValue | null>(null)

function migratePrefs(raw: AudioPrefs): AudioPrefs {
  return {
    ...raw,
    lastStationId: normalizeStationId(raw.lastStationId),
    uiSoundsEnabled: raw.uiSoundsEnabled ?? true,
  }
}

function srcMatches(audioSrc: string, trackSrc: string): boolean {
  if (!audioSrc) return false
  try {
    const resolved = new URL(trackSrc, window.location.origin).href
    return audioSrc === resolved || audioSrc.endsWith(trackSrc)
  } catch {
    return audioSrc.includes(trackSrc)
  }
}

/** Oscillator fallback so click still works before MP3 assets exist. */
function playClickFallback() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 420
    osc.type = 'square'
    gain.gain.value = 0.03
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    osc.stop(ctx.currentTime + 0.13)
    window.setTimeout(() => void ctx.close(), 200)
  } catch {
    // Ignore audio failures.
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { completeRadioTrack, findSecretSignal, isStationUnlocked, progress } =
    useProgressContext()
  const { say: consoleSay } = useConsoleContext()
  const completeRadioTrackRef = useRef(completeRadioTrack)
  const consoleSayRef = useRef(consoleSay)
  const radioProgressRef = useRef(progress.radioProgress)
  const [prefs, setPrefs] = useLocalStorage<AudioPrefs>(STORAGE_KEY, DEFAULT_PREFS)
  const migratedPrefs = migratePrefs(prefs)
  const [currentStationId, setCurrentStationId] = useState<StationId>(
    migratedPrefs.lastStationId,
  )
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [signalLost, setSignalLost] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stationIdRef = useRef(currentStationId)
  const trackIndexRef = useRef(currentTrackIndex)
  const enabledRef = useRef(migratedPrefs.enabled)
  const isPlayingRef = useRef(isPlaying)
  const loadGenerationRef = useRef(0)
  const loadedKeyRef = useRef<string | null>(null)
  const uiEngineRef = useRef<UISoundEngine | null>(null)
  const uiSoundsEnabledRef = useRef(migratedPrefs.uiSoundsEnabled)
  /** Accumulated real playback seconds for the current track (pause-safe). */
  const listenedSecondsRef = useRef(0)
  const lastMediaTimeRef = useRef(0)
  const discoveryFiredRef = useRef(false)

  const DISCOVERY_SECONDS = 10

  if (!uiEngineRef.current) {
    uiEngineRef.current = new UISoundEngine()
  }

  const station = getStation(currentStationId) ?? RADIO_STATIONS[0]
  const trackCount = station.tracks.length
  const currentTrack = station.tracks[currentTrackIndex] ?? station.tracks[0] ?? null

  useEffect(() => {
    completeRadioTrackRef.current = completeRadioTrack
  }, [completeRadioTrack])

  useEffect(() => {
    consoleSayRef.current = consoleSay
  }, [consoleSay])

  useEffect(() => {
    radioProgressRef.current = progress.radioProgress
  }, [progress.radioProgress])

  useEffect(() => {
    stationIdRef.current = currentStationId
  }, [currentStationId])

  useEffect(() => {
    trackIndexRef.current = currentTrackIndex
  }, [currentTrackIndex])

  useEffect(() => {
    enabledRef.current = migratedPrefs.enabled
  }, [migratedPrefs.enabled])

  useEffect(() => {
    uiSoundsEnabledRef.current = migratedPrefs.uiSoundsEnabled
  }, [migratedPrefs.uiSoundsEnabled])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (prefs.lastStationId !== migratedPrefs.lastStationId) {
      setPrefs((prev) => ({
        ...prev,
        lastStationId: migratedPrefs.lastStationId,
      }))
    }
  }, [migratedPrefs.lastStationId, prefs.lastStationId, setPrefs])

  // Unlock UI audio after first user gesture (autoplay policy)
  useEffect(() => {
    const unlock = () => {
      uiEngineRef.current?.markUserInteracted()
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // If persisted station is locked, fall back to bebop
  useEffect(() => {
    if (!isStationUnlocked(currentStationId)) {
      setCurrentStationId(DEFAULT_STATION)
      stationIdRef.current = DEFAULT_STATION
      setCurrentTrackIndex(0)
      trackIndexRef.current = 0
      loadedKeyRef.current = null
    }
  }, [currentStationId, isStationUnlocked])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.loop = false
    audioRef.current = audio

    const onError = () => {
      // Only real media errors — not pause / autoplay blocks
      if (audio.error) {
        setSignalLost(true)
        setIsPlaying(false)
        isPlayingRef.current = false
      }
    }

    const syncTimeline = () => {
      setCurrentTime(audio.currentTime || 0)
      const d = audio.duration
      setDuration(Number.isFinite(d) && d > 0 ? d : 0)
    }

    const onPlaying = () => {
      // Sync baseline so pause/resume does not invent listen time
      lastMediaTimeRef.current = audio.currentTime
      syncTimeline()
    }

    const onLoadedMetadata = () => {
      syncTimeline()
    }

    const onTimeUpdate = () => {
      syncTimeline()

      if (audio.paused) return
      if (stationIdRef.current === 'last-transmission') return
      if (discoveryFiredRef.current) return

      const t = audio.currentTime
      const delta = t - lastMediaTimeRef.current
      lastMediaTimeRef.current = t

      // Count continuous playback only — ignore seek jumps / stalls
      if (delta > 0 && delta < 0.75) {
        listenedSecondsRef.current += delta
      }

      if (listenedSecondsRef.current >= DISCOVERY_SECONDS) {
        discoveryFiredRef.current = true
        const sid = stationIdRef.current
        const idx = trackIndexRef.current
        const progressKey =
          STATION_PROGRESS_KEY[
            sid as Exclude<StationId, 'last-transmission'>
          ]
        const already =
          radioProgressRef.current[progressKey]?.[idx] === true
        if (already) return

        const track = getStation(sid)?.tracks[idx]
        completeRadioTrackRef.current(sid, idx, track?.title)
        consoleSayRef.current('radioDiscovery', { force: true })
      }
    }

    audio.addEventListener('error', onError)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      audio.removeEventListener('error', onError)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = migratedPrefs.muted ? 0 : migratedPrefs.volume
  }, [migratedPrefs.muted, migratedPrefs.volume])

  const playUISound = useCallback(
    (id: UISoundId, opts?: { force?: boolean }) => {
      if (!uiSoundsEnabledRef.current) return
      const engine = uiEngineRef.current
      if (!engine) return

      engine.markUserInteracted()

      // Warm the pool / detect missing assets even when falling back
      const played = engine.play(id, opts)

      // Keep the proven oscillator click until ui-click.mp3 is ready
      if (id === 'click' && !played) {
        playClickFallback()
      }
    },
    [],
  )

  const playSfx = useCallback(
    (name: SfxName) => {
      playUISound(SFX_TO_UI[name])
    },
    [playUISound],
  )

  const loadTrack = useCallback(
    async (stationId: StationId, trackIndex: number, shouldPlay: boolean) => {
      const audio = audioRef.current
      if (!audio) return

      const targetStation = getStation(stationId)
      if (!targetStation || targetStation.tracks.length === 0) return

      const safeIndex =
        ((trackIndex % targetStation.tracks.length) + targetStation.tracks.length) %
        targetStation.tracks.length
      const track = targetStation.tracks[safeIndex]
      const trackKey = `${stationId}:${safeIndex}:${track.src}`
      const generation = ++loadGenerationRef.current

      audio.pause()
      setSignalLost(false)
      setCurrentTrackIndex(safeIndex)
      trackIndexRef.current = safeIndex

      // New track: reset discovery listen accumulator (pause does NOT reset)
      listenedSecondsRef.current = 0
      lastMediaTimeRef.current = 0
      discoveryFiredRef.current = false
      setCurrentTime(0)
      setDuration(0)

      // Reset position only when changing tracks
      audio.currentTime = 0
      audio.src = track.src
      loadedKeyRef.current = trackKey

      try {
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            cleanup()
            resolve()
          }
          const onError = () => {
            cleanup()
            reject(new Error('signal lost'))
          }
          const cleanup = () => {
            audio.removeEventListener('canplaythrough', onReady)
            audio.removeEventListener('error', onError)
          }
          audio.addEventListener('canplaythrough', onReady)
          audio.addEventListener('error', onError)
          audio.load()
        })

        if (generation !== loadGenerationRef.current) return

        setCurrentTime(audio.currentTime || 0)
        const d = audio.duration
        setDuration(Number.isFinite(d) && d > 0 ? d : 0)

        if (shouldPlay) {
          try {
            await audio.play()
            if (generation !== loadGenerationRef.current) return
            setIsPlaying(true)
            isPlayingRef.current = true
            setSignalLost(false)
            if (stationId === 'last-transmission') {
              findSecretSignal()
            }
          } catch {
            // Autoplay / play() rejection is NOT a missing file
            if (generation !== loadGenerationRef.current) return
            setIsPlaying(false)
            isPlayingRef.current = false
          }
        } else {
          setIsPlaying(false)
          isPlayingRef.current = false
        }
      } catch {
        if (generation !== loadGenerationRef.current) return
        setSignalLost(true)
        setIsPlaying(false)
        isPlayingRef.current = false
      }
    },
    [findSecretSignal],
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onEnded = () => {
      // Discovery is based on ~20s listened — natural end only advances playlist
      const sid = stationIdRef.current
      const idx = trackIndexRef.current
      const current = getStation(sid)
      if (!current || current.tracks.length === 0) {
        setIsPlaying(false)
        isPlayingRef.current = false
        return
      }
      const nextIndex = (idx + 1) % current.tracks.length
      void loadTrack(sid, nextIndex, enabledRef.current)
    }

    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('ended', onEnded)
    }
  }, [loadTrack])

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setPrefs((prev) => ({ ...prev, enabled }))
      enabledRef.current = enabled
      if (!enabled) {
        audioRef.current?.pause()
        setIsPlaying(false)
        isPlayingRef.current = false
      }
    },
    [setPrefs],
  )

  const stopRadio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    loadedKeyRef.current = null
    listenedSecondsRef.current = 0
    lastMediaTimeRef.current = 0
    discoveryFiredRef.current = false
    enabledRef.current = false
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setSignalLost(false)
    setPrefs((prev) => ({
      ...prev,
      enabled: false,
      lastStationId: DEFAULT_STATION,
    }))
    setCurrentStationId(DEFAULT_STATION)
    stationIdRef.current = DEFAULT_STATION
    setCurrentTrackIndex(0)
    trackIndexRef.current = 0
  }, [setPrefs])

  // If experience is reset (boot cleared), music must not keep playing
  const prevBootComplete = useRef(progress.bootComplete)
  useEffect(() => {
    if (prevBootComplete.current && !progress.bootComplete) {
      stopRadio()
    }
    prevBootComplete.current = progress.bootComplete
  }, [progress.bootComplete, stopRadio])

  const setMuted = useCallback(
    (muted: boolean) => {
      setPrefs((prev) => ({ ...prev, muted }))
    },
    [setPrefs],
  )

  const setVolume = useCallback(
    (volume: number) => {
      setPrefs((prev) => ({ ...prev, volume: Math.min(1, Math.max(0, volume)) }))
    },
    [setPrefs],
  )

  const setUiSoundsEnabled = useCallback(
    (uiSoundsEnabled: boolean) => {
      setPrefs((prev) => ({ ...prev, uiSoundsEnabled }))
      uiSoundsEnabledRef.current = uiSoundsEnabled
    },
    [setPrefs],
  )

  const selectStation = useCallback(
    (id: StationId) => {
      if (!isStationUnlocked(id)) return
      const normalized = normalizeStationId(id)
      const stationChanged = normalized !== stationIdRef.current

      if (stationChanged) {
        audioRef.current?.pause()
        playUISound('stationChange')
      }

      setCurrentStationId(normalized)
      stationIdRef.current = normalized
      setPrefs((prev) => ({ ...prev, lastStationId: normalized }))
      void loadTrack(normalized, 0, enabledRef.current && isPlayingRef.current)
      if (normalized === 'last-transmission') {
        findSecretSignal()
      }
    },
    [findSecretSignal, isStationUnlocked, loadTrack, playUISound, setPrefs],
  )

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!migratedPrefs.enabled) {
      setPrefs((prev) => ({ ...prev, enabled: true }))
      enabledRef.current = true
    }

    const track = currentTrack
    if (!track) return

    const trackKey = `${currentStationId}:${currentTrackIndex}:${track.src}`
    const alreadyLoaded =
      loadedKeyRef.current === trackKey && srcMatches(audio.src, track.src)

    if (alreadyLoaded && !audio.error) {
      try {
        // Resume from currentTime — do NOT reset
        await audio.play()
        setIsPlaying(true)
        isPlayingRef.current = true
        setSignalLost(false)
        if (currentStationId === 'last-transmission') {
          findSecretSignal()
        }
      } catch {
        // Autoplay blocked — not a file error
        setIsPlaying(false)
        isPlayingRef.current = false
      }
      return
    }

    await loadTrack(currentStationId, currentTrackIndex, true)
  }, [
    currentStationId,
    currentTrack,
    currentTrackIndex,
    findSecretSignal,
    loadTrack,
    migratedPrefs.enabled,
    setPrefs,
  ])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    isPlayingRef.current = false
  }, [])

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause()
      return
    }
    await play()
  }, [isPlaying, pause, play])

  const nextTrack = useCallback(() => {
    const current = getStation(stationIdRef.current)
    if (!current || current.tracks.length === 0) return
    const nextIndex = (trackIndexRef.current + 1) % current.tracks.length
    void loadTrack(
      stationIdRef.current,
      nextIndex,
      enabledRef.current && isPlayingRef.current,
    )
  }, [loadTrack])

  const prevTrack = useCallback(() => {
    const current = getStation(stationIdRef.current)
    if (!current || current.tracks.length === 0) return
    const prevIndex =
      (trackIndexRef.current - 1 + current.tracks.length) % current.tracks.length
    void loadTrack(
      stationIdRef.current,
      prevIndex,
      enabledRef.current && isPlayingRef.current,
    )
  }, [loadTrack])

  const value = useMemo<AudioContextValue>(
    () => ({
      prefs: migratedPrefs,
      currentStationId,
      currentTrackIndex,
      currentTrack,
      trackCount,
      isPlaying,
      signalLost,
      currentTime,
      duration,
      setEnabled,
      setMuted,
      setVolume,
      setUiSoundsEnabled,
      stopRadio,
      selectStation,
      play,
      pause,
      togglePlay,
      nextTrack,
      prevTrack,
      playUISound,
      playSfx,
    }),
    [
      migratedPrefs,
      currentStationId,
      currentTrackIndex,
      currentTrack,
      trackCount,
      isPlaying,
      signalLost,
      currentTime,
      duration,
      setEnabled,
      setMuted,
      setVolume,
      setUiSoundsEnabled,
      stopRadio,
      selectStation,
      play,
      pause,
      togglePlay,
      nextTrack,
      prevTrack,
      playUISound,
      playSfx,
    ],
  )

  return (
    <AudioReactContext.Provider value={value}>{children}</AudioReactContext.Provider>
  )
}

export function useAudioContext() {
  const ctx = useContext(AudioReactContext)
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return ctx
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
