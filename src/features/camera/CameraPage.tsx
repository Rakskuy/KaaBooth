/**
 * features/camera/CameraPage.tsx
 * Halaman utama kamera — mengintegrasikan:
 * - useCamera (stream kamera)
 * - usePhotoSession (state machine sesi foto)
 * - SessionSettings / CountdownOverlay / FlashOverlay / PhotoStrip / ReviewScreen
 *
 * Routing halaman ini:
 *  phase='settings'  → SessionSettings
 *  phase='review'    → ReviewScreen
 *  phase='done'      → onDone() callback (ke App)
 *  lainnya           → Active session view (countdown/capturing/pausing)
 */

import { useEffect } from 'react'
import { CameraPreview } from '../../components/CameraPreview'
import { CountdownOverlay } from '../../components/CountdownOverlay'
import { ErrorScreen } from '../../components/ErrorScreen'
import { FlashOverlay } from '../../components/FlashOverlay'
import { PhotoStrip } from '../../components/PhotoStrip'
import { ReviewScreen } from '../../components/ReviewScreen'
import { SessionSettings } from '../../components/SessionSettings'
import { useCamera } from '../../hooks/useCamera'
import { usePhotoSession } from '../../hooks/usePhotoSession'
import { useSessionStore } from '../../store/sessionStore'
import { useI18n } from '../../lib/i18n'

interface CameraPageProps {
  onBack: () => void
  onDone: () => void
}

export function CameraPage({ onBack, onDone }: CameraPageProps) {
  const { t } = useI18n()
  const camera = useCamera('user')
  const session = usePhotoSession(camera.videoRef, camera.facingMode, camera.stream)
  const { phase, currentIndex, photos, aspectRatio, retakeAll, setPhase } =
    useSessionStore()

  /* Navigasi ke editor saat phase=done */
  useEffect(() => {
    if (phase === 'done') onDone()
  }, [phase, onDone])

  const handleUseDemoPhotos = () => {
    const sampleColors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981']
    const sampleEmojis = ['✨', '💖', '📸', '🎉']

    sampleColors.forEach((color, idx) => {
      const c = document.createElement('canvas')
      c.width = 600
      c.height = 800
      const ctx = c.getContext('2d')
      if (ctx) {
        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 600, 800)
        grad.addColorStop(0, color)
        grad.addColorStop(1, '#0d0d14')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 600, 800)

        // Center card
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath()
        ctx.roundRect(50, 100, 500, 600, 24)
        ctx.fill()

        // Text & Emoji
        ctx.textAlign = 'center'
        ctx.font = '80px sans-serif'
        ctx.fillText(sampleEmojis[idx], 300, 360)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 36px sans-serif'
        ctx.fillText(`Foto Sampel #${idx + 1}`, 300, 450)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '22px sans-serif'
        ctx.fillText('SnapBooth Preview', 300, 500)
      }
      useSessionStore.getState().setPhoto(idx, c.toDataURL('image/jpeg', 0.85))
    })
    setPhase('done')
  }

  /* ── Loading ──────────────────────────────────────── */
  if (camera.status === 'loading' || camera.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{
            borderColor: 'var(--c-surface2)',
            borderTopColor: 'var(--c-primary)',
          }}
          role="status"
          aria-label={t('camera_loading')}
        />
        <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
          {t('camera_loading')}
        </p>
      </div>
    )
  }

  /* ── Error ────────────────────────────────────────── */
  if (
    camera.status === 'denied' ||
    camera.status === 'no-camera' ||
    camera.status === 'unsupported'
  ) {
    return (
      <ErrorScreen
        status={camera.status}
        onRetry={camera.retryCamera}
        onUseDemoPhotos={handleUseDemoPhotos}
      />
    )
  }

  /* ── Settings ─────────────────────────────────────── */
  if (phase === 'settings') {
    return (
      <SessionSettings
        videoRef={camera.videoRef}
        facingMode={camera.facingMode}
        canSwitch={camera.canSwitch}
        onSwitchCamera={camera.switchCamera}
        onBack={onBack}
        stream={camera.stream}
      />
    )
  }

  /* ── Review ───────────────────────────────────────── */
  if (phase === 'review') {
    return (
      <ReviewScreen
        onProceed={() => setPhase('done')}
        onRetakeAll={retakeAll}
      />
    )
  }

  /* ── Active session: countdown / capturing / pausing ── */
  const isOverlayPhase =
    phase === 'countdown' || phase === 'capturing' || phase === 'pausing'

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 py-6">
      {/* Photo indicator */}
      <div className="w-full flex items-center justify-between">
        {/* Cancel button */}
        <button
          id="btn-session-cancel"
          type="button"
          onClick={session.cancelSession}
          className="text-sm font-medium transition-opacity hover:opacity-70 active:opacity-50"
          style={{ color: 'var(--c-muted)' }}
        >
          ✕ {t('session_cancel')}
        </button>

        {/* Progress label */}
        <p className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
          {t('session_photo_of')
            .replace('{n}', String(currentIndex + 1))
            .replace('{total}', String(photos.length))}
        </p>
      </div>

      {/* Camera preview + overlays */}
      <div className="w-full flex items-center justify-center min-h-[260px]">
        <CameraPreview
          videoRef={camera.videoRef}
          facingMode={camera.facingMode}
          aspectRatio={aspectRatio}
          stream={camera.stream}
          className="w-auto h-[48dvh] max-h-[460px] max-w-full shadow-2xl"
        >
          {/* Countdown / pausing overlay */}
          {isOverlayPhase && (
            <CountdownOverlay
              phase={phase}
              countdown={session.countdown}
              photoIndex={currentIndex}
              photoCount={photos.length}
            />
          )}

          {/* Flash on capture */}
          <FlashOverlay isVisible={session.isFlashing} />
        </CameraPreview>
      </div>

      {/* Photo strip */}
      <PhotoStrip
        photos={photos}
        currentIndex={currentIndex}
        isActive={true}
      />

      {/* Camera facing info */}
      <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
        {camera.facingMode === 'user' ? '🤳 Kamera Depan' : '📷 Kamera Belakang'}
      </p>
    </div>
  )
}
