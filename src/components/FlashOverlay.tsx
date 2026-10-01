/**
 * components/FlashOverlay.tsx
 * Efek flash putih saat foto diambil.
 * Pointer-events: none agar tidak menghalangi interaksi.
 */

interface FlashOverlayProps {
  isVisible: boolean
}

export function FlashOverlay({ isVisible }: FlashOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      aria-hidden="true"
      className="flash-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: 'white',
        pointerEvents: 'none',
      }}
    />
  )
}
