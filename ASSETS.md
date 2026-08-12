# ASSETS

Birthday Bounty ships with original CSS/SVG pixel UI so the experience works without external art.

Optional folders under `public/assets/` are ready for upgrades.

## Asset inventory

| Asset name | Location | Purpose | Source | License |
|---|---|---|---|---|
| App favicon | `index.html` (inline SVG) | Browser tab icon | Original | Original |
| Public icon | `public/vite.svg` | Static icon | Original | Original |
| Ship silhouette | `src/components/navigation/ShipNavigation.tsx` | Cockpit illustration | Original SVG | Original |
| Pixel icons | `src/components/ui/PixelIcon.tsx` | Navigation / HUD | Original SVG paths | Original |
| Starfield | `src/components/effects/Starfield.tsx` | Background stars | Procedural | Original |
| CRT / scanlines | `src/components/effects/*` | Screen atmosphere | CSS | Original |
| Terraria player/hazards | `src/games/TerrariaSurvival.tsx` | Mini-game sprites | Canvas rectangles | Original |
| Bounty targets | `src/games/BountyHunter.tsx` | Click targets | CSS panels | Original |
| Track 01 | `public/audio/track-01.mp3` | Radio Channel 01 | To be provided | To be provided |
| Track 02 | `public/audio/track-02.mp3` | Radio Channel 02 | To be provided | To be provided |
| Track 03 | `public/audio/track-03.mp3` | Radio Channel 03 | To be provided | To be provided |
| Track 04 | `public/audio/track-04.mp3` | Radio Channel 04 | To be provided | To be provided |
| Secret track | `public/audio/track-secret.mp3` | Unknown Signal | To be provided | To be provided |
| Background art | `public/assets/backgrounds/` | Scene backdrops | To be provided | To be provided |
| Spaceship art | `public/assets/spaceship/` | Ship interiors | To be provided | To be provided |
| UI chrome | `public/assets/ui/` | Panels / frames | To be provided | To be provided |
| Icons | `public/assets/icons/` | Extra pixel icons | To be provided | To be provided |
| Sprites | `public/assets/sprites/` | Characters / enemies | To be provided | To be provided |
| Effects | `public/assets/effects/` | Particles / glitches | To be provided | To be provided |
| Easter eggs | `public/assets/easter-eggs/` | Hidden visuals | To be provided | To be provided |
| Press Start 2P / VT323 | Google Fonts (linked in `index.html`) | Pixel typography | Google Fonts | OFL |

## Recommended upgrades

1. Short original (or licensed) MP3s for the four radio channels.
2. A hand-drawn pixel ship interior background.
3. Custom pixel sprites for Terraria Survival.
4. Optional SFX files if you prefer samples over the soft WebAudio beeps.
5. Self-host fonts in `public/fonts/` if you want offline font loading.

## Rules

- Do **not** add copyrighted anime screenshots or official game sprites.
- Prefer original pixel art or clearly licensed assets.
- Keep `image-rendering: pixelated` for any pixel images.
