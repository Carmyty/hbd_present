import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Starfield } from '../components/effects/Starfield'
import { PixelButton } from '../components/ui/PixelButton'
import { PixelDivider } from '../components/ui/PixelDivider'
import { PixelPanel } from '../components/ui/PixelPanel'
import { displayName, displayNameUpper } from '../data/identity'
import { canAccessBirthday } from '../data/progressLogic'
import { useProgress } from '../hooks/useProgress'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Birthday() {
  const navigate = useNavigate()
  const { progress, completeFinalMission } = useProgress()
  const reduced = useReducedMotion()
  const allowed = canAccessBirthday(progress)
  const identity = progress.identity
  const name = displayName(identity)
  const nameUpper = displayNameUpper(identity)
  const level = identity?.age ?? 0
  const isMemories = identity?.mode === 'memories'

  useEffect(() => {
    if (!allowed) {
      navigate('/bounty', { replace: true })
    }
  }, [allowed, navigate])

  useEffect(() => {
    if (allowed && !progress.finalMissionComplete) {
      completeFinalMission()
    }
  }, [allowed, progress.finalMissionComplete, completeFinalMission])

  if (!allowed) {
    return (
      <div className="screen-frame">
        <PixelPanel className="p-4">
          <p className="locked-overlay">ACCESS DENIED</p>
          <p className="mt-3 terminal-text text-center">
            REQUIREMENT: Complete all bounty objectives first.
          </p>
        </PixelPanel>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] bg-[var(--bg-primary)]">
      <Starfield density={40} />
      <div className="screen-frame flex items-center justify-center">
        <motion.div
          className="w-full max-w-2xl"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <PixelPanel className="p-5 sm:p-8">
            <p className="font-pixel text-[10px] text-[var(--success)]">
              {isMemories ? 'ARCHIVE RECOVERED' : 'MISSION COMPLETE'}
            </p>
            <h1 className="mt-4 font-pixel text-[16px] leading-relaxed text-[var(--highlight)]">
              {nameUpper}
            </h1>
            <p className="mt-2 font-pixel text-[10px] text-[var(--accent)]">
              LEVEL {level}
            </p>
            <PixelDivider className="my-5" />
            <p className="font-pixel text-[9px] text-[var(--text-secondary)]">
              {isMemories
                ? 'MEMORY CHANNEL STABILIZED.'
                : 'ANOTHER YEAR COMPLETED.'}
            </p>
            <div className="mt-5 space-y-3 terminal-text text-xl leading-relaxed">
              {isMemories ? (
                <>
                  <p>The birthday window has already passed.</p>
                  <p>
                    What remains are the transmissions you left behind —
                    games, songs, and half-finished quests still humming in the
                    dark.
                  </p>
                  <p>
                    This channel doesn&apos;t celebrate the day.
                    <br />
                    It keeps the signal alive.
                  </p>
                  <p className="text-[var(--highlight)]">
                    Welcome to your memories, {name}.
                    <br />
                    The archive is still listening.
                  </p>
                </>
              ) : (
                <>
                  <p>There&apos;s still a lot of world left to explore.</p>
                  <p>
                    More games to play.
                    <br />
                    More music to find.
                    <br />
                    More ridiculous things to laugh about.
                    <br />
                    More questionable decisions to make.
                  </p>
                  <p>So here&apos;s to level {level}.</p>
                  <p className="text-[var(--highlight)]">
                    Happy Birthday, {name}.
                    <br />
                    The next quest is already waiting.
                  </p>
                </>
              )}
            </div>
            <div className="mt-8">
              <PixelButton
                fullWidth
                sfx="confirm"
                onClick={() => {
                  navigate('/reward')
                }}
              >
                {isMemories ? 'OPEN ARCHIVE' : 'CLAIM REWARD'}
              </PixelButton>
            </div>
          </PixelPanel>
        </motion.div>
      </div>
    </div>
  )
}
