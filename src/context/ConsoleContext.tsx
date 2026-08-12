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
  CONSOLE_PRIORITY_CONTEXTS,
  pickConsoleMessage,
  type ConsoleMessageContext,
} from '../data/consoleMessages'

const COOLDOWN_MS = 4000
const COMMENT_VISIBLE_MS = 3200
const RAPID_WINDOW_MS = 900
const RAPID_CLICK_THRESHOLD = 5
const SAME_BUTTON_THRESHOLD = 3

export type ConsoleComment = {
  id: string
  text: string
  context: ConsoleMessageContext
}

interface ConsoleContextValue {
  comment: ConsoleComment | null
  say: (
    context: ConsoleMessageContext,
    opts?: { force?: boolean; text?: string },
  ) => void
  noteInteraction: (id: string) => void
  noteLockedAccess: (id?: string) => void
  clearComment: () => void
}

const ConsoleReactContext = createContext<ConsoleContextValue | null>(null)

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [comment, setComment] = useState<ConsoleComment | null>(null)
  const lastSayAt = useRef(0)
  const lastText = useRef<string | null>(null)
  const clearTimer = useRef<number | null>(null)

  const clickTimes = useRef<number[]>([])
  const sameButton = useRef<{ id: string; count: number }>({ id: '', count: 0 })
  const lockedCounts = useRef<Record<string, number>>({})

  const clearComment = useCallback(() => {
    setComment(null)
    if (clearTimer.current) {
      window.clearTimeout(clearTimer.current)
      clearTimer.current = null
    }
  }, [])

  const say = useCallback(
    (
      context: ConsoleMessageContext,
      opts?: { force?: boolean; text?: string },
    ) => {
      const now = Date.now()
      const isPriority =
        opts?.force || CONSOLE_PRIORITY_CONTEXTS.includes(context)

      if (!isPriority && now - lastSayAt.current < COOLDOWN_MS) {
        return
      }

      const text = opts?.text ?? pickConsoleMessage(context, lastText.current)
      lastSayAt.current = now
      lastText.current = text

      if (clearTimer.current) window.clearTimeout(clearTimer.current)

      setComment({
        id: `${context}-${now}`,
        text,
        context,
      })

      clearTimer.current = window.setTimeout(() => {
        setComment(null)
        clearTimer.current = null
      }, COMMENT_VISIBLE_MS)
    },
    [],
  )

  const noteInteraction = useCallback(
    (id: string) => {
      const now = Date.now()
      clickTimes.current = clickTimes.current.filter(
        (t) => now - t < RAPID_WINDOW_MS,
      )
      clickTimes.current.push(now)

      if (sameButton.current.id === id) {
        sameButton.current.count += 1
      } else {
        sameButton.current = { id, count: 1 }
      }

      if (sameButton.current.count >= SAME_BUTTON_THRESHOLD) {
        sameButton.current.count = 0
        say('sameButton')
        return
      }

      if (clickTimes.current.length >= RAPID_CLICK_THRESHOLD) {
        clickTimes.current = []
        say('rapidClicks')
      }
    },
    [say],
  )

  const noteLockedAccess = useCallback(
    (id = 'locked') => {
      const count = (lockedCounts.current[id] ?? 0) + 1
      lockedCounts.current[id] = count
      if (count >= 4) {
        say('lockedRepeat', { force: count % 4 === 0 })
      } else if (count >= 2) {
        say('locked')
      } else {
        say('locked', { force: true })
      }
    },
    [say],
  )

  useEffect(() => {
    return () => {
      if (clearTimer.current) window.clearTimeout(clearTimer.current)
    }
  }, [])

  const value = useMemo(
    () => ({
      comment,
      say,
      noteInteraction,
      noteLockedAccess,
      clearComment,
    }),
    [comment, say, noteInteraction, noteLockedAccess, clearComment],
  )

  return (
    <ConsoleReactContext.Provider value={value}>
      {children}
    </ConsoleReactContext.Provider>
  )
}

export function useConsoleContext() {
  const ctx = useContext(ConsoleReactContext)
  if (!ctx) {
    throw new Error('useConsole must be used within ConsoleProvider')
  }
  return ctx
}
