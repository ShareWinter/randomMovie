interface HandDrawnIconProps {
  className?: string
}

export function HomeIcon({ className = '' }: HandDrawnIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`}>
      <path
        d="M8 32 L32 8 L56 32 L56 56 L40 56 L40 40 L24 40 L24 56 L8 56 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'url(#sketchy)',
          transform: 'rotate(-1deg)'
        }}
      />
      <defs>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
    </svg>
  )
}

export function DoorIcon({ className = '' }: HandDrawnIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`}>
      <path
        d="M16 8 L48 8 L48 56 L16 56 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          filter: 'url(#doorSketch)',
          transform: 'rotate(0.5deg)'
        }}
      />
      <circle
        cx="40"
        cy="32"
        r="3"
        fill="currentColor"
        style={{
          filter: 'url(#doorSketch)'
        }}
      />
      <path
        d="M16 56 L48 56"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2,4"
        style={{
          opacity: 0.5
        }}
      />
      <defs>
        <filter id="doorSketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>
    </svg>
  )
}

export function MovieIcon({ className = '' }: HandDrawnIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`}>
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        style={{
          filter: 'url(#movieSketch)',
          transform: 'rotate(-0.5deg)'
        }}
      />
      <circle cx="20" cy="20" r="4" fill="currentColor" style={{ filter: 'url(#movieSketch)' }} />
      <circle cx="44" cy="20" r="4" fill="currentColor" style={{ filter: 'url(#movieSketch)' }} />
      <circle cx="20" cy="44" r="4" fill="currentColor" style={{ filter: 'url(#movieSketch)' }} />
      <circle cx="44" cy="44" r="4" fill="currentColor" style={{ filter: 'url(#movieSketch)' }} />
      <path
        d="M24 32 L40 32 M32 24 L32 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ opacity: 0.3 }}
      />
      <defs>
        <filter id="movieSketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
    </svg>
  )
}

export function ChartIcon({ className = '' }: HandDrawnIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`}>
      <path
        d="M8 56 L56 56"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: 'url(#chartSketch)' }}
      />
      <path
        d="M8 56 L8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: 'url(#chartSketch)' }}
      />
      <rect
        x="16"
        y="36"
        width="8"
        height="20"
        fill="currentColor"
        rx="2"
        style={{
          filter: 'url(#chartSketch)',
          transform: 'rotate(-1deg)',
          transformOrigin: 'center bottom'
        }}
      />
      <rect
        x="28"
        y="24"
        width="8"
        height="32"
        fill="currentColor"
        rx="2"
        style={{
          filter: 'url(#chartSketch)',
          transform: 'rotate(0.5deg)',
          transformOrigin: 'center bottom'
        }}
      />
      <rect
        x="40"
        y="16"
        width="8"
        height="40"
        fill="currentColor"
        rx="2"
        style={{
          filter: 'url(#chartSketch)',
          transform: 'rotate(-0.5deg)',
          transformOrigin: 'center bottom'
        }}
      />
      <defs>
        <filter id="chartSketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>
    </svg>
  )
}

export function StarIcon({ className = '' }: HandDrawnIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={`w-full h-full ${className}`}>
      <path
        d="M32 8 L38 26 L56 26 L42 38 L48 56 L32 44 L16 56 L22 38 L8 26 L26 26 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{
          filter: 'url(#starSketch)',
          transform: 'rotate(-2deg)'
        }}
      />
      <defs>
        <filter id="starSketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
    </svg>
  )
}
