interface PixelInstagramIconProps {
  className?: string
}

export function PixelInstagramIcon({ className = 'w-5 h-5' }: PixelInstagramIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pixel-ig-gradient"
          x1="0"
          y1="24"
          x2="24"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#feda75" />
          <stop offset="0.25" stopColor="#fa7e1e" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="0.75" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>

      {/* 8-Bit Pixel Outer Body */}
      <rect x="5" y="2" width="14" height="20" fill="url(#pixel-ig-gradient)" />
      <rect x="2" y="5" width="20" height="14" fill="url(#pixel-ig-gradient)" />
      <rect x="3" y="3" width="18" height="18" fill="url(#pixel-ig-gradient)" />

      {/* 8-Bit Black Outline Shadow */}
      <rect x="5" y="1" width="14" height="1" fill="#000000" />
      <rect x="5" y="22" width="14" height="1" fill="#000000" />
      <rect x="1" y="5" width="1" height="14" fill="#000000" />
      <rect x="22" y="5" width="1" height="14" fill="#000000" />
      <rect x="2" y="3" width="2" height="2" fill="#000000" />
      <rect x="20" y="3" width="2" height="2" fill="#000000" />
      <rect x="2" y="19" width="2" height="2" fill="#000000" />
      <rect x="20" y="19" width="2" height="2" fill="#000000" />

      {/* 8-Bit White Inner Camera Frame */}
      <rect x="6" y="4" width="12" height="2" fill="#ffffff" />
      <rect x="6" y="18" width="12" height="2" fill="#ffffff" />
      <rect x="4" y="6" width="2" height="12" fill="#ffffff" />
      <rect x="18" y="6" width="2" height="12" fill="#ffffff" />
      <rect x="5" y="5" width="2" height="2" fill="#ffffff" />
      <rect x="17" y="5" width="2" height="2" fill="#ffffff" />
      <rect x="5" y="17" width="2" height="2" fill="#ffffff" />
      <rect x="17" y="17" width="2" height="2" fill="#ffffff" />

      {/* Pixel Flash Light (Top Right) */}
      <rect x="15" y="7" width="2" height="2" fill="#ffffff" />

      {/* Pixel Center Lens (8-Bit Camera Ring) */}
      <rect x="9" y="8" width="6" height="2" fill="#ffffff" />
      <rect x="9" y="14" width="6" height="2" fill="#ffffff" />
      <rect x="8" y="9" width="2" height="6" fill="#ffffff" />
      <rect x="14" y="9" width="2" height="6" fill="#ffffff" />
      <rect x="10" y="10" width="4" height="4" fill="#ffffff" />
    </svg>
  )
}
