import { useAudioContext } from '../context/AudioContext'
import type { UISoundId } from '../audio/uiSounds'
import { canUseHoverSound } from '../audio/uiSounds'

export function useAudio() {
  return useAudioContext()
}

/** Props for desktop-only hover SFX on important interactive controls. */
export function useHoverSoundProps(enabled = true) {
  const { playUISound } = useAudioContext()

  return {
    onMouseEnter: () => {
      if (!enabled) return
      if (!canUseHoverSound()) return
      playUISound('hover')
    },
  }
}

export type { UISoundId }
