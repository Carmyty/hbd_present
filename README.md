# BIRTHDAY BOUNTY

An interactive pixel-art birthday adventure.

Not a landing page — a small indie game terminal: access gate, bounty network, spaceship computer, arcade mini-games, space radio, encrypted database, secret signal, and a final transmission.

Players enter their own callsign and birth date. Clearance and finale mode depend on that birth signal.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router
- Lucide React (minimal HUD icons)
- localStorage (progress + audio prefs)

No backend. No auth. Fully client-side.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy

### Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`

### GitHub Pages

1. Set Vite `base` in `vite.config.ts` to your repo name, e.g. `base: '/hbd_present/'`.
2. Build with `npm run build`.
3. Deploy the `dist` folder with GitHub Pages / Actions.

## Project structure

```
src/
  components/   UI, effects, navigation, radio, games, achievements
  pages/        Boot → Reward screens
  games/        Hostile Sector, Bounty Hunter, Signal Decoder
  context/      Progress + Audio providers
  hooks/        Progress, audio, localStorage, reduced motion
  data/         Achievements, missions, radio, database, identity gate
  styles/       Design system (pixel + CRT)
public/
  audio/        Drop MP3s here
  assets/       Optional image folders
  fonts/        Optional self-hosted fonts
```

## How progress works

Progress is stored in `localStorage` under:

- `birthday-bounty-progress-v3`
- `birthday-bounty-audio-v1`

Tracked:

- player identity (name, birth date, age, mode)
- bounty acceptance
- completed mini-games
- achievements (8)
- unlocked radio stations
- secret signal + final mission

Refresh-safe. Reset from **DEV // SETTINGS** on the ship cockpit screen.

### Achievements

1. Accepted the bounty  
2. Survived Hostile Sector  
3. Claimed a target  
4. Decoded the signal  
5. Found the radio  
6. Decrypted the database  
7. Found the secret signal  
8. Completed the final transmission  

Secret signal unlocks after the first six.

## How to add audio

Place files in `public/audio/`:

```
track-01.mp3
track-02.mp3
track-03.mp3
track-04.mp3
track-secret.mp3   (optional, unknown station)
```

If a file is missing, the radio shows **SIGNAL LOST / AUDIO FILE NOT FOUND** and does not crash.

Audio is opt-in (no surprise autoplay). Preference persists in localStorage.

Update titles/artists in `src/data/radio.ts`.

## How to add assets

See `ASSETS.md`. Drop files into `public/assets/...` and reference them from components. Until then, the app uses original CSS/SVG pixel UI.

## Customize

| What | Where |
|------|--------|
| Access gate / age logic | `src/data/identity.ts` |
| Database dossier copy | `src/data/database.ts` |
| Mission copy | `src/data/missions.ts` |
| Finale message | `src/pages/Birthday.tsx` |
| Radio metadata | `src/data/radio.ts` |
| Achievements | `src/data/achievements.ts` |
| Arcade game blurbs | `src/data/games.ts` |

## Accessibility

- Keyboard usable boot + buttons
- Focus styles
- Touch targets ≥ 44px on mobile controls
- `prefers-reduced-motion` reduces major animations

## License / originality

Original UI and gameplay inspired by space-western / CRT / arcade vibes.  
No copyrighted anime/game sprites or official logos are included.
