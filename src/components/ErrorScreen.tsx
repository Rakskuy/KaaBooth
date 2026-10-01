/**
 * components/ErrorScreen.tsx
 * Layar error untuk tiap status kamera.
 * Menampilkan instruksi spesifik per browser dan tombol "Coba Lagi".
 */

import { useI18n } from '../lib/i18n'
import type { CameraStatus } from '../hooks/useCamera'

interface ErrorScreenProps {
  status: Exclude<CameraStatus, 'idle' | 'loading' | 'ready'>
  onRetry: () => void
  onUseDemoPhotos?: () => void
}

interface ErrorContent {
  icon: string
  title: string
  desc: string
  steps?: string[]
}

export function ErrorScreen({ status, onRetry, onUseDemoPhotos }: ErrorScreenProps) {
  const { t } = useI18n()

  const getContent = (status: ErrorScreenProps['status']): ErrorContent => {
    switch (status) {
      case 'denied':
        return {
          icon: '🚫',
          title: t('error_denied_title'),
          desc: t('error_denied_desc'),
          steps: [t('error_denied_chrome'), t('error_denied_safari')],
        }
      case 'no-camera':
        return {
          icon: '📷',
          title: t('error_nocamera_title'),
          desc: t('error_nocamera_desc'),
        }
      case 'unsupported':
        return {
          icon: '⚠️',
          title: t('error_unsupported_title'),
          desc: t('error_unsupported_desc'),
        }
    }
  }

  const content = getContent(status)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 py-10 text-center">
      <div
        className="glass-card w-full max-w-md p-8 flex flex-col items-center gap-5"
        role="alert"
        aria-live="assertive"
      >
        {/* Icon */}
        <span className="text-6xl" aria-hidden="true">
          {content.icon}
        </span>

        {/* Title */}
        <h2 className="text-xl font-bold text-white">{content.title}</h2>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
          {content.desc}
        </p>

        {/* Step-by-step instructions */}
        {content.steps && (
          <ol className="w-full text-left space-y-3 mt-1">
            {content.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary2))',
                    color: 'white',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--c-muted)' }}>{step}</span>
              </li>
            ))}
          </ol>
        )}

        {/* Retry button */}
        <button
          id="btn-retry-camera"
          type="button"
          onClick={onRetry}
          className="mt-2 w-full py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          {t('error_retry')}
        </button>

        {/* Demo Mode Button for testing/preview without camera */}
        {onUseDemoPhotos && (
          <button
            id="btn-use-demo-photos"
            type="button"
            onClick={onUseDemoPhotos}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10"
          >
            📸 Gunakan Foto Sampel (Coba Editor)
          </button>
        )}
      </div>
    </div>
  )
}
