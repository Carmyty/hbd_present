import { useNavigate } from 'react-router-dom'
import { useAudio } from '../../hooks/useAudio'

export function BackButton({
  to = '/ship',
  label = 'RETURN',
  className = '',
}: {
  to?: string
  label?: string
  className?: string
}) {
  const navigate = useNavigate()
  const { playUISound } = useAudio()

  return (
    <button
      type="button"
      className={`touch-target pixel-btn pixel-btn-ghost inline-flex items-center gap-2 !px-3 !py-2 !text-[8px] ${className}`}
      aria-label={label}
      onClick={() => {
        playUISound('back')
        navigate(to)
      }}
    >
      <span aria-hidden className="text-[var(--accent)]">
        ◄
      </span>
      <span>{label}</span>
    </button>
  )
}
