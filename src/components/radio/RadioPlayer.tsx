import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RADIO_STATIONS } from '../../data/radio'
import {
  STATION_PROGRESS_KEY,
  STATION_UNLOCK_REQUIREMENT,
} from '../../data/progressLogic'
import { useAudio } from '../../hooks/useAudio'
import { useProgress } from '../../hooks/useProgress'
import { PixelButton } from '../ui/PixelButton'
import { PixelPanel } from '../ui/PixelPanel'
import { PixelWindow } from '../ui/PixelWindow'
import { RadioStationButton } from './RadioStation'
import { ScrambledSignalText } from './ScrambledSignalText'
import { SignalMeter } from './SignalMeter'
import { Waveform } from './Waveform'

function padTrack(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RadioPlayer() {
  const {
    prefs,
    currentStationId,
    currentTrackIndex,
    currentTrack,
    trackCount,
    isPlaying,
    signalLost,
    currentTime,
    duration,
    selectStation,
    togglePlay,
    nextTrack,
    prevTrack,
    setMuted,
    setVolume,
    setEnabled,
    playUISound,
  } = useAudio()
  const { progress, isStationUnlocked } = useProgress()
  const [unlockFlash, setUnlockFlash] = useState<
    null | 'detected' | 'decrypted' | 'ready'
  >(null)
  const unlockAnimStarted = useRef(false)

  const station =
    RADIO_STATIONS.find((s) => s.id === currentStationId) ?? RADIO_STATIONS[0]
  const isSecretStation = station.id === 'last-transmission'
  const secretUnlocked = progress.secretSignalUnlocked
  const stationLocked = !isStationUnlocked(station.id)

  const trackDiscovered = (() => {
    if (isSecretStation) return true
    if (currentStationId === 'last-transmission') return true
    const key = STATION_PROGRESS_KEY[currentStationId]
    return progress.radioProgress[key][currentTrackIndex] === true
  })()

  const titleText = currentTrack?.title ?? '—'
  const artistText = currentTrack?.artist ?? '—'

  useEffect(() => {
    if (!secretUnlocked || unlockAnimStarted.current) return
    const seenKey = 'birthday-bounty-radio-unlock-seen'
    if (window.localStorage.getItem(seenKey) === '1') return
    unlockAnimStarted.current = true
    setUnlockFlash('detected')
    playUISound('notification')
    const t1 = window.setTimeout(() => {
      setUnlockFlash('decrypted')
      playUISound('signalLock', { force: true })
    }, 1200)
    const t2 = window.setTimeout(() => {
      setUnlockFlash('ready')
      playUISound('unlock', { force: true })
    }, 2400)
    const t3 = window.setTimeout(() => {
      setUnlockFlash(null)
      window.localStorage.setItem(seenKey, '1')
    }, 4200)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [secretUnlocked, playUISound])

  useEffect(() => {
    if (stationLocked) {
      selectStation('bebop')
    }
  }, [selectStation, stationLocked])

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <PixelWindow title="SPACE RADIO // 88.7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-pixel text-[10px] text-[var(--highlight)]">
              {station.channel} — {station.name}
            </p>
            {isSecretStation && secretUnlocked ? (
              <p className="mt-2 font-pixel text-[7px] text-[var(--highlight)]">
                SIGNAL LOCKED
                <br />
                TRANSMISSION DECRYPTED
              </p>
            ) : null}
            <p className="mt-2 font-pixel text-[8px] text-[var(--accent)]">
              NOW PLAYING
              {!trackDiscovered ? (
                <span className="ml-2 text-[var(--text-muted)]">// DECODING</span>
              ) : null}
            </p>
            <p className="mt-1 font-terminal text-xl text-[var(--text-primary)]">
              <ScrambledSignalText text={titleText} revealed={trackDiscovered} />
            </p>
            <p className="terminal-text">
              <ScrambledSignalText text={artistText} revealed={trackDiscovered} />
            </p>
            <p className="mt-2 font-pixel text-[8px] text-[var(--text-muted)]">
              {padTrack(currentTrackIndex + 1)} / {padTrack(trackCount)}
            </p>
            <p className="mt-2 font-pixel text-[8px] text-[var(--accent)]">
              {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
            </p>
          </div>
          <div className="text-right">
            <SignalMeter
              strength={signalLost ? 1 : isPlaying ? 5 : 3}
              locked={isSecretStation && secretUnlocked}
            />
          </div>
        </div>

        {unlockFlash ? (
          <PixelPanel tone="mid" className="mb-4 p-3">
            <p className="font-pixel text-[8px] text-[var(--highlight)]">
              {unlockFlash === 'detected' && 'UNKNOWN SIGNAL DETECTED'}
              {unlockFlash === 'decrypted' && (
                <>
                  ENCRYPTION:
                  <br />
                  DECRYPTED
                </>
              )}
              {unlockFlash === 'ready' && (
                <>
                  CHANNEL ???:
                  <br />
                  LAST TRANSMISSION
                </>
              )}
            </p>
          </PixelPanel>
        ) : null}

        <PixelPanel tone="mid" className="mb-4 p-3">
          <Waveform active={isPlaying && !signalLost} />
          {signalLost ? (
            <p className="mt-3 font-pixel text-[8px] text-[var(--danger)]">
              SIGNAL LOST
              <br />
              AUDIO FILE NOT FOUND
            </p>
          ) : (
            <p className="mt-3 hud-label">
              {prefs.enabled
                ? isPlaying
                  ? isSecretStation
                    ? 'SIGNAL LOCKED'
                    : 'BROADCASTING'
                  : 'STANDBY'
                : 'AUDIO OPT-IN REQUIRED'}
            </p>
          )}
        </PixelPanel>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <PixelButton
            variant="ghost"
            aria-label="Previous track"
            onClick={prevTrack}
          >
            <SkipBack size={16} />
          </PixelButton>
          <PixelButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={() => {
              if (!prefs.enabled) setEnabled(true)
              void togglePlay()
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </PixelButton>
          <PixelButton
            variant="ghost"
            aria-label="Next track"
            onClick={nextTrack}
          >
            <SkipForward size={16} />
          </PixelButton>
          <PixelButton
            variant="ghost"
            aria-label={prefs.muted ? 'Unmute' : 'Mute'}
            onClick={() => setMuted(!prefs.muted)}
          >
            {prefs.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </PixelButton>
        </div>

        <label className="block">
          <span className="hud-label">VOLUME</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={prefs.volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
            aria-label="Volume"
          />
        </label>
      </PixelWindow>

      <div className="grid gap-2">
        {RADIO_STATIONS.map((s) => {
          const locked = !isStationUnlocked(s.id)
          const requirement = STATION_UNLOCK_REQUIREMENT[s.id]
          return (
            <RadioStationButton
              key={s.id}
              station={s}
              active={s.id === currentStationId}
              locked={locked}
              requirement={
                locked && requirement
                  ? `COMPLETE ${requirement.channel}`
                  : undefined
              }
              onSelect={() => {
                if (!locked) selectStation(s.id)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
