import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScreenNoise } from '../components/effects/ScreenNoise'
import { Starfield } from '../components/effects/Starfield'
import { BackButton } from '../components/navigation/BackButton'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelPanel } from '../components/ui/PixelPanel'
import { TerminalCursor } from '../components/effects/TerminalCursor'
import { useProgress } from '../hooks/useProgress'
import { useAudio } from '../hooks/useAudio'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function SecretSignal() {
  const navigate = useNavigate()
  const { progress, findSecretSignal } = useProgress()
  const { playUISound } = useAudio()
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [tuning, setTuning] = useState(false)

  useEffect(() => {
    if (!progress.secretSignalUnlocked) {
      navigate('/bounty', { replace: true })
    }
  }, [progress.secretSignalUnlocked, navigate])

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), reduced ? 0 : 900)
    return () => window.clearTimeout(id)
  }, [reduced])

  // Navigate only after secretSignalFound persists (avoids race with setState)
  useEffect(() => {
    if (tuning && progress.secretSignalFound) {
      navigate('/birthday')
    }
  }, [tuning, progress.secretSignalFound, navigate])

  if (!progress.secretSignalUnlocked) {
    return (
      <div className="screen-frame">
        <PixelPanel className="p-4">
          <p className="locked-overlay">ACCESS DENIED</p>
          <p className="mt-3 terminal-text text-center">
            REQUIREMENT: Complete previous bounty objectives.
          </p>
        </PixelPanel>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] bg-black">
      <Starfield density={30} />
      <ScreenNoise active />
      <div className="screen-frame flex flex-col items-center justify-center gap-3">
        <div className="w-full max-w-xl">
          <BackButton to="/bounty" label="RETURN TO TERMINAL" />
        </div>
        <motion.div
          className="w-full max-w-xl glitch-soft"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PixelPanel className="p-5">
            <p className="font-pixel text-[10px] text-[var(--danger)] blink">
              UNKNOWN SIGNAL DETECTED.
            </p>
            <p className="mt-4 terminal-text text-xl">
              SIGNAL SOURCE: CLASSIFIED
              {!ready ? <TerminalCursor /> : null}
            </p>
            <p className="mt-3 terminal-text">
              Static clears. A quiet frequency waits underneath the noise.
            </p>
            {ready ? (
              <div className="mt-6">
                <PixelButton
                  fullWidth
                  sfx="confirm"
                  disabled={tuning}
                  onClick={() => {
                    findSecretSignal()
                    window.setTimeout(() => {
                      playUISound('signalLock', { force: true })
                    }, 160)
                    setTuning(true)
                  }}
                >
                  {tuning ? 'LOCKING...' : 'TUNE IN'}
                </PixelButton>
              </div>
            ) : (
              <p className="mt-6 hud-label">LOCKING FREQUENCY...</p>
            )}
          </PixelPanel>
        </motion.div>
      </div>
    </div>
  )
}
