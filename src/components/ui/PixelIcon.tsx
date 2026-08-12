type IconName =
  | 'cockpit'
  | 'arcade'
  | 'radio'
  | 'database'
  | 'bounty'
  | 'star'
  | 'target'
  | 'signal'
  | 'ship'

const paths: Record<IconName, string> = {
  cockpit:
    'M2 10h20M4 10l2-6h12l2 6M7 10v4h2v-2h6v2h2v-4M10 4v2M14 4v2',
  arcade:
    'M6 4h12v6H6zm2 8h8v8H8zm3-6h2v2h-2zm-1 10h2v2h-2zm4 0h2v2h-2zM4 20h16',
  radio:
    'M4 8h16v10H4zm2 2h4v2H6zm6 1h6M6 14h12M8 6l8-3',
  database:
    'M4 6c0-1.5 4-3 8-3s8 1.5 8 3v12c0 1.5-4 3-8 3s-8-1.5-8-3zm0 0v4c0 1.5 4 3 8 3s8-1.5 8-3V6m-16 4v4c0 1.5 4 3 8 3s8-1.5 8-3',
  bounty: 'M12 3l3 5h5l-4 4 2 6-6-3-6 3 2-6-4-4h5zm0 7v5',
  star: 'M12 3l2 6h6l-5 4 2 6-5-3-5 3 2-6-5-4h6z',
  target: 'M12 4a8 8 0 100 16 8 8 0 000-16zm0 3a5 5 0 110 10 5 5 0 010-10zm0 3a2 2 0 100 4 2 2 0 000-4z',
  signal: 'M4 16h2v4H4zm4-4h2v8H8zm4-4h2v12h-2zm4-4h2v16h-2zm4 2h2v14h-2z',
  ship: 'M3 14l9-8 9 8-3 5H6zm6-1h6v3H9z',
}

export function PixelIcon({
  name,
  size = 24,
  className = '',
  title,
}: {
  name: IconName
  size?: number
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[name]} />
    </svg>
  )
}
