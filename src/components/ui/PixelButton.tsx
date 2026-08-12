import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useAudio, useHoverSoundProps } from '../../hooks/useAudio'
import { useConsole } from '../../hooks/useConsole'
import type { UISoundId } from '../../audio/uiSounds'

type Variant = 'primary' | 'ghost' | 'danger' | 'success'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  fullWidth?: boolean
  /** true = click, false = none, or a specific UI sound id */
  sfx?: boolean | UISoundId
  /** Play hover SFX on desktop pointer enter */
  hoverSfx?: boolean
  /** Optional id for console interaction tracking */
  interactionId?: string
}

const variantClass: Record<Variant, string> = {
  primary: '',
  ghost: 'pixel-btn-ghost',
  danger: 'pixel-btn-danger',
  success: 'pixel-btn-success',
}

export function PixelButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  sfx = true,
  hoverSfx = false,
  interactionId,
  onClick,
  onMouseEnter,
  ...rest
}: PixelButtonProps) {
  const { playUISound } = useAudio()
  const { noteInteraction } = useConsole()
  const hoverProps = useHoverSoundProps(hoverSfx)

  return (
    <button
      type="button"
      className={`pixel-btn touch-target ${variantClass[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onMouseEnter={(e) => {
        hoverProps.onMouseEnter()
        onMouseEnter?.(e)
      }}
      onClick={(e) => {
        noteInteraction(interactionId ?? `btn-${variant}`)
        if (sfx === true) playUISound('click')
        else if (typeof sfx === 'string') playUISound(sfx)
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
