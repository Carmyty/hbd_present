import { useEffect } from 'react'
import { GameHUD } from '../components/navigation/GameHUD'
import { ShipNavigation } from '../components/navigation/ShipNavigation'
import { RadioPlayer } from '../components/radio/RadioPlayer'
import { useProgress } from '../hooks/useProgress'

export function Radio() {
  const { markRadioVisited, visitLocation } = useProgress()

  useEffect(() => {
    visitLocation('radio')
    markRadioVisited()
  }, [markRadioVisited, visitLocation])

  return (
    <div className="screen-frame pb-24 md:pb-8">
      <GameHUD locationLabel="RADIO" showBack />
      <ShipNavigation current="radio" compact />
      <h1 className="mb-4 font-pixel text-[12px] text-[var(--highlight)]">
        SPACE RADIO // 88.7
      </h1>
      <RadioPlayer />
    </div>
  )
}
