import type { RadioStation, StationId } from '../types'

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'bebop',
    channel: 'CHANNEL 01',
    name: 'BEBOP',
    description: 'Space-western jazz drift. Late orbit only.',
    tracks: [
      {
        id: 'bebop-01',
        title: 'Cosmos',
        artist: 'The Seatbelts',
        src: '/audio/bebop-01.mp3',
      },
      {
        id: 'bebop-02',
        title: 'Piano Black',
        artist: 'The Seatbelts',
        src: '/audio/bebop-02.mp3',
      },
      {
        id: 'bebop-03',
        title: 'Memory',
        artist: 'The Seatbelts',
        src: '/audio/bebop-03.mp3',
      },
      {
        id: 'bebop-04',
        title: 'You Make Me Cool',
        artist: 'Masayoshi Furukawa',
        src: '/audio/bebop-04.mp3',
      },
    ],
  },
  {
    id: 'static',
    channel: 'CHANNEL 02',
    name: 'STATIC',
    description: 'Broken transmissions. Loud enough to drown out the void.',
    tracks: [
      {
        id: 'static-01',
        title: 'Built to Fall',
        artist: 'Trivium',
        src: '/audio/static-01.mp3',
      },
      {
        id: 'static-02',
        title: 'Last Resort',
        artist: 'Papa Roach',
        src: '/audio/static-02.mp3',
      },
      {
        id: 'static-03',
        title: 'The Middle',
        artist: 'Jimmy Eat World',
        src: '/audio/static-03.mp3',
      },
      {
        id: 'static-04',
        title: 'The Pretender',
        artist: 'Foo Fighters',
        src: '/audio/static-04.mp3',
      },
    ],
  },
  {
    id: 'anime',
    channel: 'CHANNEL 03',
    name: 'ANIME SIGNAL',
    description: 'Battle themes, opening sequences, and suspicious power levels.',
    tracks: [
      {
        id: 'anime-01',
        title: 'COLORS',
        artist: 'FLOW',
        src: '/audio/anime-01.mp3',
      },
      {
        id: 'anime-02',
        title: 'Again',
        artist: 'YUI',
        src: '/audio/anime-02.mp3',
      },
      {
        id: 'anime-03',
        title: 'Haruka Mirai',
        artist: 'Kankaku Piero',
        src: '/audio/anime-03.mp3',
      },
      {
        id: 'anime-04',
        title: 'Departure!',
        artist: 'Masatoshi Ono',
        src: '/audio/anime-04.mp3',
      },
    ],
  },
  {
    id: 'late-night',
    channel: 'CHANNEL 04',
    name: 'LATE NIGHT',
    description: 'Darker transmissions for long hyperspace jumps.',
    tracks: [
      {
        id: 'late-night-01',
        title: 'Sorbitol',
        artist: 'Men I Trust',
        src: '/audio/late-night-01.mp3',
      },
      {
        id: 'late-night-02',
        title: 'Asleep Among Endives',
        artist: 'Ichiko Aoba',
        src: '/audio/late-night-02.mp3',
      },
      {
        id: 'late-night-03',
        title: 'Behind the Moon Shadow',
        artist: 'Lamp',
        src: '/audio/late-night-03.mp3',
      },
      {
        id: 'late-night-04',
        title: 'Numb',
        artist: 'Men I Trust',
        src: '/audio/late-night-04.mp3',
      },
    ],
  },
  {
    id: 'last-transmission',
    channel: 'CHANNEL ???',
    name: 'LAST TRANSMISSION',
    description: "A signal that wasn't supposed to be here.",
    locked: true,
    tracks: [
      {
        id: 'last-transmission',
        title: 'Starman',
        artist: 'David Bowie',
        src: '/audio/last-transmission.mp3',
      },
    ],
  },
]

export const DEFAULT_STATION: StationId = 'bebop'

export function getStation(id: StationId): RadioStation | undefined {
  return RADIO_STATIONS.find((s) => s.id === id)
}

export function normalizeStationId(id: string | null | undefined): StationId {
  if (id === 'unknown') return 'last-transmission'
  if (RADIO_STATIONS.some((s) => s.id === id)) return id as StationId
  return DEFAULT_STATION
}
