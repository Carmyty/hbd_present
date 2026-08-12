# AGENTS.md

## Cursor Cloud specific instructions

### Project

Birthday Bounty (`hbd_present`) — a 100% client-side Vite + React 18 + TypeScript
single-page "adventure game". There is no backend, no database, and no
environment variables; all state persists in the browser via `localStorage`.
Package manager is npm (`package-lock.json`).

### Services

Only one service: the Vite dev server. Commands are defined in `package.json`:

- Dev server: `npm run dev` (serves on `http://localhost:5173/`)
- Lint: `npm run lint` (ESLint flat config; a few `react-refresh/only-export-components` warnings are pre-existing and non-blocking)
- Build: `npm run build` (`tsc -b && vite build`)
- Preview a production build: `npm run preview`

### Non-obvious gotchas

- The entry screen (`/`, `src/pages/Boot.tsx`) gates access by the entered birth
  date, compared against a fixed calendar gate defined in `src/data/identity.ts`
  (`GATE_MONTH=8`, `GATE_DAY=14`). A birth `month/day` **before** Aug 14 is
  rejected with "ACCESS DENIED". Use `month/day` of exactly `08-14` (e.g.
  `1995-08-14`) for the full "birthday" experience, or after Aug 14 for the
  "memories" experience. This is the most common blocker when testing the flow.
- Deep routes (`/ship`, `/arcade`, etc.) are guarded and redirect back to `/`
  unless boot + bounty acceptance progress exists in `localStorage`. Clear
  `localStorage` (or use a fresh browser profile) to replay from the start.
- Some `public/audio/*.mp3` tracks are placeholders (see `ASSETS.md`); missing
  audio does not break the app, tracks just won't play.
