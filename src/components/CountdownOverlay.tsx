/**
 * components/CountdownOverlay.tsx
 * Overlay di atas CameraPreview selama fase countdown dan pausing.
 * - Angka besar dengan animasi pop per detik (key trick)
 * - "✓ Tersimpan!" saat jeda antar foto
 * - Indikator "Foto N dari M"
 */

import { useI18n } from '../lib/i18n'

interface CountdownOverlayProps {
  phase: 'countdown' | 'capturing' | 'pausing'
  countdown: number
  photoIndex: number   // 0-based
  photoCount: number
}

export function CountdownOverlay({
  phase,
  countdown,
  photoIndex,
  photoCount,
}: CountdownOverlayProps) {
  const { t } = useI18n()
  if (phase === 'capturing') return null

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 select-none"
      style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(2px)' }}
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Photo indicator */}
      <p
        className="text-sm font-semibold mb-4 tracking-wider uppercase"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        {t('session_photo_of')
          .replace('{n}', String(photoIndex + 1))
          .replace('{total}', String(photoCount))}
      </p>

      {phase === 'countdown' && (
        /* key={countdown} memaksa re-mount → animasi CSS ulang setiap detik */
        <span
          key={countdown}
          className="countdown-number"
          aria-label={`${countdown} detik`}
        >
          {countdown}
        </span>
      )}

      {phase === 'pausing' && (
        <div className="flex flex-col items-center gap-3 saved-anim">
          <span className="text-7xl" aria-hidden="true">✓</span>
          <span className="text-xl font-bold text-white">
            {t('session_photo_saved')}
          </span>
        </div>
      )}
    </div>
  )
}
