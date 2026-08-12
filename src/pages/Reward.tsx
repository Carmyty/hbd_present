import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Starfield } from '../components/effects/Starfield'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelPanel } from '../components/ui/PixelPanel'
import { useProgress } from '../hooks/useProgress'
import { useReducedMotion } from '../hooks/useReducedMotion'

const REWARDS = [
  '+100 XP',
  '+1 FRIEND',
  '+1 CO-OP PARTNER',
  '+∞ MUSIC',
]

export function Reward() {
  const navigate = useNavigate()
  const { progress, claimReward } = useProgress()
  const reduced = useReducedMotion()
  const isMemories = progress.identity?.mode === 'memories'

  useEffect(() => {
    if (!progress.finalMissionComplete) {
      navigate('/bounty', { replace: true })
      return
    }
    claimReward()
  }, [progress.finalMissionComplete, claimReward, navigate])

  return (
    <div className="relative min-h-[100dvh]">
      <Starfield density={35} />
      <div className="screen-frame flex items-center justify-center">
        <motion.div
          className="w-full max-w-xl"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PixelPanel className="p-5 sm:p-7">
            <p className="font-pixel text-[10px] text-[var(--accent)]">
              {isMemories ? 'ARCHIVE UNLOCKED' : 'REWARD UNLOCKED'}
            </p>
            <ul className="mt-5 space-y-2">
              {REWARDS.map((item) => (
                <li key={item} className="font-pixel text-[10px] text-[var(--highlight)]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 terminal-text text-xl">
              {isMemories
                ? 'The memories stay online.'
                : 'See you in the next game.'}
            </p>

            <div className="mt-6 space-y-3">
              <PixelButton fullWidth variant="ghost" onClick={() => navigate('/ship')}>
                CONTINUE
              </PixelButton>
            </div>

            <div className="mt-8 pixel-border pixel-panel-mid p-4">
              <p className="font-pixel text-[10px] text-[var(--accent)]">NEXT QUEST</p>
              <p className="mt-3 terminal-text">STATUS: AVAILABLE</p>
              <p className="terminal-text">OBJECTIVE: FIND SOMETHING FUN.</p>
              <p className="mt-4 font-pixel text-[9px] text-[var(--highlight)]">
                [ SEE YOU THERE ]
              </p>
            </div>
          </PixelPanel>
        </motion.div>
      </div>
    </div>
  )
}
