import { useState } from 'react'
import { GameHUD } from '../components/navigation/GameHUD'
import { ShipNavigation } from '../components/navigation/ShipNavigation'
import { GameCard } from '../components/games/GameCard'
import { ARCADE_GAMES } from '../data/games'
import { HostileSector } from '../games/HostileSector'
import { BountyHunter } from '../games/BountyHunter'
import { SignalDecoder } from '../games/SignalDecoder'
import { useProgress } from '../hooks/useProgress'
import type { GameId } from '../types'

export function Arcade() {
  const { progress } = useProgress()
  const [active, setActive] = useState<GameId | null>(null)

  return (
    <div className="screen-frame pb-24 md:pb-8">
      <GameHUD locationLabel="ARCADE" showBack />
      <ShipNavigation current="arcade" compact />

      <h1 className="mb-2 font-pixel text-[12px] text-[var(--highlight)]">
        ARCADE // LEVEL 01
      </h1>
      <p className="mb-4 terminal-text">SELECT A GAME</p>

      {active === 'hostile-sector' ? (
        <HostileSector onExit={() => setActive(null)} />
      ) : null}
      {active === 'bounty-hunter' ? (
        <BountyHunter onExit={() => setActive(null)} />
      ) : null}
      {active === 'signal-decoder' ? (
        <SignalDecoder onExit={() => setActive(null)} />
      ) : null}

      {!active ? (
        <div className="grid gap-3 md:grid-cols-3">
          {ARCADE_GAMES.map((game, index) => (
            <div key={game.id}>
              <p className="mb-2 font-pixel text-[8px] text-[var(--text-muted)]">
                {index + 1}. {game.title}
                {game.subtitle ? ` // ${game.subtitle}` : ''}
              </p>
              <GameCard
                game={game}
                completed={progress.completedGames.includes(game.id)}
                highScore={progress.highScores[game.id]}
                onStart={() => setActive(game.id)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
