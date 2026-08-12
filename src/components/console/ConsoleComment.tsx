import { AnimatePresence, motion } from 'framer-motion'
import { useConsole } from '../../hooks/useConsole'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function ConsoleComment() {
  const { comment } = useConsole()
  const reduced = useReducedMotion()

  return (
    <div className="pointer-events-none fixed bottom-16 left-3 z-[55] max-w-xs md:bottom-4 md:left-4">
      <AnimatePresence>
        {comment ? (
          <motion.div
            key={comment.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 4 }}
            className="border border-[var(--pixel-border)] bg-[var(--panel)]/95 px-3 py-2 shadow-[3px_3px_0_#050607]"
            role="status"
            aria-live="polite"
          >
            <p className="font-pixel text-[7px] text-[var(--accent)]">
              CONSOLE // BB-01
            </p>
            <p className="mt-1 font-terminal text-lg leading-snug text-[var(--text-secondary)]">
              {comment.text}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
