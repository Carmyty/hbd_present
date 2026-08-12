import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useProgress } from '../../hooks/useProgress'

export function RequireBoot({ children }: { children: ReactNode }) {
  const { progress } = useProgress()
  if (!progress.identity || !progress.bootComplete) {
    return <Navigate to="/" replace />
  }
  return children
}

export function RequireBounty({ children }: { children: ReactNode }) {
  const { progress } = useProgress()
  if (!progress.identity || !progress.bootComplete) {
    return <Navigate to="/" replace />
  }
  if (!progress.acceptedBounty) return <Navigate to="/bounty-network" replace />
  return children
}
