import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { useAudio } from '../../hooks/useAudio'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { UISoundId } from '../../audio/uiSounds'

function toastSound(title: string): UISoundId {
  if (title.includes('ACHIEVEMENT')) return 'achievement'
  if (title.includes('UNLOCKED')) return 'unlock'
  return 'notification'
}

export function AchievementToast() {
  const { toast, clearToast } = useProgress()
  const { playUISound } = useAudio()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!toast) return
    const sound = toastSound(toast.title)
    // Let game-success finish before achievement cue when both fire
    const delay = sound === 'achievement' ? 420 : 0
    const soundTimer = window.setTimeout(() => {
      playUISound(sound, { force: true })
    }, delay)
    const clearTimer = window.setTimeout(clearToast, 3200)
    return () => {
      window.clearTimeout(soundTimer)
      window.clearTimeout(clearTimer)
    }
  }, [toast, clearToast, playUISound])

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] max-w-sm">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={reduced ? false : { opacity: 0, y: -12, x: 12 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            className="pixel-border pixel-panel-light p-3 shadow-[4px_4px_0_#050607]"
            role="status"
            aria-live="polite"
          >
            <p className="font-pixel text-[8px] text-[var(--accent)]">{toast.title}</p>
            <p className="mt-1 font-terminal text-lg text-[var(--text-primary)]">
              {toast.description}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
