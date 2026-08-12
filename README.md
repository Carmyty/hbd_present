# Birthday Bounty

## What it is

An interactive pixel-art adventure: a space terminal where you enter your name and birth date, accept a bounty, and explore the ship to recover a lost transmission.

This is not a static page. It is a small game with progress, mini-games, radio, an encrypted database, and an ending that depends on your birth signal.

## Goal of the experience

Identify yourself, accept the mission, and complete the ship objectives:

1. Survive the arcade  
2. Tune the radio and discover every station  
3. Open the bounty database  
4. Unlock the secret signal  
5. Reach the final transmission  

If your date opens the birthday channel, the ending is a celebration.  
If it falls after that window, the ending becomes a **memories** archive.  
If it falls before… access stays locked.

## Theme

Space-western + CRT + arcade.

Inspired by a Bebop-style ship: scanline screens, pixel typography, a snarky console, and a bounty network that treats your birthday (or your memories) like a classified mission.

## Music

The ship radio has several stations. Each track unlocks progress.

**CHANNEL 01 — BEBOP**  
- The Seatbelts — *Cosmos*  
- The Seatbelts — *Piano Black*  
- The Seatbelts — *Memory*  
- Masayoshi Furukawa — *You Make Me Cool*

**CHANNEL 02 — STATIC**  
- Trivium — *Built to Fall*  
- Papa Roach — *Last Resort*  
- Jimmy Eat World — *The Middle*  
- Foo Fighters — *The Pretender*

**CHANNEL 03 — ANIME SIGNAL**  
- FLOW — *COLORS*  
- YUI — *Again*  
- Kankaku Piero — *Haruka Mirai*  
- Masatoshi Ono — *Departure!*

**CHANNEL 04 — LATE NIGHT**  
- Men I Trust — *Sorbitol*  
- Ichiko Aoba — *Asleep Among Endives*  
- Lamp — *Behind the Moon Shadow*  
- Men I Trust — *Numb*

**CHANNEL ??? — LAST TRANSMISSION**  
- David Bowie — *Starman*

## Folder organization

```
public/
  audio/      Radio station music
  assets/    Room for art / visual extras

src/
  pages/         Adventure screens (boot → reward)
  games/         Arcade mini-games
  components/    UI, radio, navigation, CRT effects
  data/          Missions, achievements, stations, identity
  context/       Progress and audio saved in the browser
```

## Navigation

1. **Access Gate** — enter your callsign and birth date  
2. **Boot** — terminal startup  
3. **Bounty Network** — accept the mission  
4. **Ship / Cockpit** — main hub  
5. From the ship you can visit:  
   - **Arcade** — Hostile Sector, Bounty Hunter, Signal Decoder  
   - **Radio** — stations and transmissions  
   - **Database** — subject file  
   - **Bounty Terminal** — objective checklist  
6. **Secret Signal** — unlocks when the requirements are met  
7. **Finale** — birthday or memories, depending on your date  
8. **Reward** — end of the transmission  

On mobile, the bottom bar moves you between ship locations.

---

Made with care as a gift.  
Hope you enjoy it — and that the signal reaches you in full.
