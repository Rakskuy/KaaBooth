/**
 * components/InAppBrowserWarning.tsx
 * Peringatan saat user membuka via browser in-app
 * (Instagram, TikTok, WhatsApp, Facebook, dll.)
 */

import { isIOS } from '../lib/browserDetect'
import { useI18n } from '../lib/i18n'

export function InAppBrowserWarning() {
  const { t } = useI18n()
  const onIOS = isIOS()
  const currentUrl = window.location.href

  function handleOpenExternal() {
    // Untuk Android: coba buka di Chrome via intent
    if (!onIOS) {
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
    }
    // Untuk iOS: tidak bisa buka Safari langsung dari JS,
    // cukup tampilkan instruksi (tombol sudah berubah teks)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t('inapp_title')}
    >
      <div className="glass-card w-full max-w-sm p-7 flex flex-col items-center gap-5 text-center">
        {/* Icon */}
        <span className="text-5xl" aria-hidden="true">🌐</span>

        {/* Title */}
        <h2 className="text-xl font-bold text-white">{t('inapp_title')}</h2>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
          {t('inapp_desc')}
        </p>

        {/* URL copy hint */}
        <div
          className="w-full rounded-xl p-3 text-xs font-mono break-all select-all"
          style={{ background: 'var(--c-surface2)', color: 'var(--c-muted)' }}
          aria-label="Salin URL ini"
        >
          {currentUrl}
        </div>
        <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
          ☝️ Ketuk lama URL di atas lalu pilih <strong>Salin</strong>, kemudian tempel di{' '}
          {onIOS ? 'Safari' : 'Chrome'}.
        </p>

        {/* Open button (only works on Android) */}
        {!onIOS && (
          <button
            id="btn-open-chrome"
            type="button"
            onClick={handleOpenExternal}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {t('inapp_open_chrome')}
          </button>
        )}

        {onIOS && (
          <p className="text-xs font-medium" style={{ color: 'var(--c-primary)' }}>
            Ketuk ikon ··· atau Bagikan → Buka di Safari
          </p>
        )}
      </div>
    </div>
  )
}
