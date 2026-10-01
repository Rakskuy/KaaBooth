/**
 * components/ReviewScreen.tsx
 * Layar review setelah semua foto diambil.
 * Fitur:
 * - Tampilkan semua foto dalam grid
 * - Retake satu foto (masuk sesi countdown lagi untuk slot itu)
 * - Upload dari galeri sebagai pengganti kamera
 * - Ulang semua foto
 * - Lanjutkan ke tahap berikutnya
 */

import { useRef } from 'react'
import { useSessionStore } from '../store/sessionStore'
import { useI18n } from '../lib/i18n'

interface ReviewScreenProps {
  onProceed: () => void
  onRetakeAll: () => void
}

export function ReviewScreen({ onProceed, onRetakeAll }: ReviewScreenProps) {
  const { t } = useI18n()
  const { photos, photoCount, startRetake, setPhoto } = useSessionStore()
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  /* Upload file dari galeri untuk slot tertentu */
  function handleUpload(index: number, file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) setPhoto(index, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  /* Grid columns berdasarkan jumlah foto */
  const gridClass =
    photoCount === 1
      ? 'grid-cols-1 max-w-xs mx-auto'
      : photoCount === 3
        ? 'grid-cols-3'
        : 'grid-cols-2'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4 py-6 min-h-[100dvh]">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{t('review_title')}</h2>
        <span className="text-sm" style={{ color: 'var(--c-muted)' }}>
          {photoCount} {t('session_photo_unit')}
        </span>
      </div>

      {/* Photo grid */}
      <div className={`grid ${gridClass} gap-3 w-full`}>
        {photos.map((photo, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {/* Photo slot */}
            <div
              className="relative w-full rounded-xl overflow-hidden"
              style={{ aspectRatio: '3/4', background: 'var(--c-surface2)' }}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl" style={{ color: 'var(--c-muted)' }}>
                    📷
                  </span>
                </div>
              )}

              {/* Slot number badge */}
              <span
                className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                }}
              >
                {i + 1}
              </span>
            </div>

            {/* Action buttons per slot */}
            <div className="flex gap-1">
              {/* Retake */}
              <button
                id={`btn-retake-${i}`}
                type="button"
                onClick={() => startRetake(i)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95"
                style={{
                  background: 'var(--c-surface2)',
                  color: 'var(--c-muted)',
                  border: '1px solid var(--c-border)',
                }}
              >
                {t('review_retake_one')}
              </button>

              {/* Upload dari galeri */}
              <button
                id={`btn-upload-${i}`}
                type="button"
                onClick={() => fileInputRefs.current[i]?.click()}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95"
                style={{
                  background: 'var(--c-surface2)',
                  color: 'var(--c-muted)',
                  border: '1px solid var(--c-border)',
                }}
                aria-label={`Upload foto untuk slot ${i + 1}`}
              >
                {t('review_upload')}
              </button>

              {/* Hidden file input */}
              <input
                ref={(el) => { fileInputRefs.current[i] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden="true"
                onChange={(e) => handleUpload(i, e.target.files?.[0])}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          id="btn-review-proceed"
          type="button"
          onClick={onProceed}
          className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-150 hover:scale-[1.01] active:scale-[0.98]"
          style={{
            background:
              'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          {t('review_proceed')}
        </button>
        <button
          id="btn-review-retake-all"
          type="button"
          onClick={onRetakeAll}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
          style={{
            background: 'var(--c-surface2)',
            color: 'var(--c-muted)',
            border: '1px solid var(--c-border)',
          }}
        >
          {t('review_retake_all')}
        </button>
      </div>
    </div>
  )
}
