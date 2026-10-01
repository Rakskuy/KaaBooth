/**
 * components/PhotoStrip.tsx
 * Strip thumbnail foto di bawah camera preview.
 * Slot kosong tampil sebagai placeholder bernomor.
 * Slot aktif (sedang difoto) mendapat highlight.
 */

interface PhotoStripProps {
  photos: (string | null)[]
  currentIndex: number
  isActive: boolean  // true saat sesi berjalan (bukan di settings/review)
}

export function PhotoStrip({ photos, currentIndex, isActive }: PhotoStripProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 w-full"
      role="group"
      aria-label="Strip foto"
    >
      {photos.map((photo, i) => {
        const isCurrentSlot = isActive && i === currentIndex
        const isFilled = photo !== null

        return (
          <div
            key={i}
            className="relative flex-1 max-w-[72px] rounded-xl overflow-hidden"
            style={{
              aspectRatio: '3/4',
              border: isCurrentSlot
                ? '2px solid var(--c-primary)'
                : '2px solid var(--c-border)',
              boxShadow: isCurrentSlot ? 'var(--shadow-glow)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              background: 'var(--c-surface2)',
            }}
            aria-label={`Slot foto ${i + 1}${isFilled ? ' (terisi)' : ''}${isCurrentSlot ? ' (sedang difoto)' : ''}`}
          >
            {isFilled ? (
              <img
                src={photo}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-lg font-bold"
                  style={{
                    color: isCurrentSlot ? 'var(--c-primary)' : 'var(--c-muted)',
                    opacity: 0.6,
                  }}
                >
                  {i + 1}
                </span>
              </div>
            )}

            {/* Indikator "sedang difoto" */}
            {isCurrentSlot && !isFilled && (
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
