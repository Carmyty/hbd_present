import { useEffect, useState } from 'react'

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*<>/\\|░▒▓█'

function scramblePreservingShape(source: string): string {
  let out = ''
  for (const ch of source) {
    if (ch === ' ' || ch === '-' || ch === "'" || ch === '!' || ch === '.') {
      out += ch
    } else {
      out += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    }
  }
  return out
}

/**
 * Shows scrambled static glyphs until `revealed`, then the real label.
 */
export function ScrambledSignalText({
  text,
  revealed,
  className = '',
  intervalMs = 55,
}: {
  text: string
  revealed: boolean
  className?: string
  intervalMs?: number
}) {
  const [display, setDisplay] = useState(() =>
    revealed ? text : scramblePreservingShape(text),
  )

  useEffect(() => {
    if (revealed) {
      setDisplay(text)
      return
    }

    setDisplay(scramblePreservingShape(text))
    const id = window.setInterval(() => {
      setDisplay(scramblePreservingShape(text))
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [text, revealed, intervalMs])

  return (
    <span className={className} aria-label={revealed ? text : 'Decoding signal'}>
      {display || '—'}
    </span>
  )
}
