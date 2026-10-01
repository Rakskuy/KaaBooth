/**
 * features/result/ResultPage.tsx
 * Halaman Hasil Akhir & Berbagi (Tahap 5).
 * Fitur:
 * - Preview besar hasil photobooth dengan styling estetik & responsif
 * - Tombol "Bagikan" dengan Web Share API (navigator.share + navigator.canShare)
 * - Fallback jika tidak didukung: Tombol WhatsApp & Salin Gambar ke Clipboard
 * - Tombol "Simpan ke Galeri" dengan panduan visual khusus iPhone (tekan lama gambar)
 * - Tombol Unduh PNG, JPEG, dan GIF Animasi
 * - Tombol "Foto Lagi" dengan dialog konfirmasi aman sebelum mengosongkan sesi
 * - Tombol "Mulai Baru" dan "Ubah Desain"
 */

import { useState, useEffect, useMemo } from 'react'
import {
  generatePhotoboothFilename,
  downloadFile,
  exportCanvasAsBlob,
} from '../../lib/composer'
import {
  sharePhotoboothFile,
  shareToWhatsApp,
  copyImageToClipboard,
} from '../../lib/shareHelper'
import { isIOS } from '../../lib/browserDetect'
import { generateSessionGif, type GifMode } from '../../lib/gifGenerator'
import { useSessionStore } from '../../store/sessionStore'
import { QrCodeModal } from '../../components/QrCodeModal'
import { SendEmailModal } from '../../components/SendEmailModal'
import { useI18n } from '../../lib/i18n'

interface ResultPageProps {
  canvas: HTMLCanvasElement | null
  onEditAgain: () => void
  onRetakeSession: () => void
  onStartOver: () => void
  eventId?: string | null
}

export function ResultPage({
  canvas,
  onEditAgain,
  onRetakeSession,
  onStartOver,
  eventId = null,
}: ResultPageProps) {
  const { t } = useI18n()
  const { photos } = useSessionStore()

  const [pngBlob, setPngBlob] = useState<Blob | null>(null)
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)

  // Modal State
  const [showQrModal, setShowQrModal] = useState<boolean>(false)
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false)
  const [showIosGuideModal, setShowIosGuideModal] = useState<boolean>(false)
  const [showConfirmRetakeModal, setShowConfirmRetakeModal] = useState<boolean>(false)
  const [showConfirmNewSessionModal, setShowConfirmNewSessionModal] = useState<boolean>(false)

  // GIF State
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false)
  const [gifProgress, setGifProgress] = useState<number>(0)

  // Inisialisasi imageUrl dari canvas
  const imageUrl = useMemo(() => {
    return canvas ? canvas.toDataURL('image/png', 0.98) : ''
  }, [canvas])

  // Inisialisasi blob dari canvas yang telah dikomposisi
  useEffect(() => {
    if (!canvas) return
    let isCancelled = false

    exportCanvasAsBlob(canvas, 'image/png', 0.98)
      .then((blob) => {
        if (!isCancelled) setPngBlob(blob)
      })
      .catch((err) => console.warn('Gagal membuat blob hasil:', err))

    return () => {
      isCancelled = true
    }
  }, [canvas])

  /* ── Handler Web Share API ─────────────────────────── */
  const handleShare = async () => {
    if (!pngBlob) return

    try {
      setIsSharing(true)
      const filename = generatePhotoboothFilename('png')
      const shared = await sharePhotoboothFile({
        blob: pngBlob,
        filename,
        title: 'KaBooth Moments 📸',
        text: 'Lihat hasil fotoku dari KaBooth! 📸✨',
      })

      if (!shared) {
        // Fallback jika tidak didukung atau dibatalkan
        shareToWhatsApp()
      }
    } catch (err) {
      console.warn('Share error:', err)
      shareToWhatsApp()
    } finally {
      setIsSharing(false)
    }
  }

  /* ── Handler Salin Gambar ──────────────────────────── */
  const handleCopyImage = async () => {
    if (!pngBlob) return
    const success = await copyImageToClipboard(pngBlob)
    if (success) {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    } else {
      alert('Browser tidak mendukung salin gambar otomatis. Gunakan tombol Unduh atau Bagikan.')
    }
  }

  /* ── Handler Simpan ke Galeri ──────────────────────── */
  const handleSaveToGallery = () => {
    if (isIOS()) {
      // iPhone / iPad: Buka panduan tekan lama foto
      setShowIosGuideModal(true)
    } else if (pngBlob) {
      // Android / Desktop: langsung trigger unduh ke galeri
      const filename = generatePhotoboothFilename('png')
      downloadFile(pngBlob, filename)
    }
  }

  /* ── Handler Unduh PNG / JPEG ──────────────────────── */
  const handleDownloadImage = async (format: 'image/png' | 'image/jpeg') => {
    if (!canvas) return
    try {
      setIsExporting(true)
      const ext = format === 'image/png' ? 'png' : 'jpg'
      const filename = generatePhotoboothFilename(ext)
      const blob = await exportCanvasAsBlob(canvas, format, 0.96)
      downloadFile(blob, filename)
    } catch (err) {
      console.error('Gagal unduh foto:', err)
      alert('Terjadi kesalahan saat mengunduh gambar.')
    } finally {
      setIsExporting(false)
    }
  }

  /* ── Handler Unduh GIF ─────────────────────────────── */
  const handleDownloadGif = async (mode: GifMode = 'boomerang') => {
    try {
      setIsGeneratingGif(true)
      setGifProgress(0)

      const result = await generateSessionGif({
        photos,
        filterOptions: {
          preset: 'normal',
          brightness: 0,
          contrast: 0,
          saturation: 0,
          smoothSkin: 0,
        },
        stickers: [],
        mode,
        delayMs: 350,
        maxWidth: 600,
        onProgress: (p) => setGifProgress(p),
      })

      const filename = generatePhotoboothFilename('gif')
      downloadFile(result.blob, filename)
    } catch (err) {
      console.error('Gagal membuat GIF:', err)
      alert('Gagal membuat animasi GIF.')
    } finally {
      setIsGeneratingGif(false)
      setGifProgress(0)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] w-full" style={{ background: 'var(--c-bg)' }}>
      {/* ── Top Header ───────────────────────────────── */}
      <header
        className="w-full flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: 'rgba(13, 13, 20, 0.85)',
          borderColor: 'var(--c-border)',
        }}
      >
        <button
          id="btn-result-edit-again"
          type="button"
          onClick={onEditAgain}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: 'var(--c-surface2)',
            color: 'var(--c-text)',
            border: '1px solid var(--c-border)',
          }}
        >
          ← {t('result_btn_edit_again')}
        </button>

        <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
          {t('result_title')}
        </h1>

        <button
          id="btn-result-retake-session"
          type="button"
          onClick={() => setShowConfirmRetakeModal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {t('result_btn_retake_session')}
        </button>
      </header>

      {/* ── Main Content Grid (Dual Column on Desktop) ─ */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto overflow-hidden">
        {/* ── Left Column: Big Result Preview ──────────── */}
        <section
          className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative min-h-[400px] lg:min-h-auto overflow-y-auto"
          style={{ background: 'radial-gradient(circle at center, #1e1b2e 0%, #0d0d14 100%)' }}
        >
          {imageUrl ? (
            <div
              className="relative max-w-full max-h-[72vh] rounded-2xl p-2 transition-all duration-300 group cursor-pointer"
              onClick={handleSaveToGallery}
              title="Ketuk untuk opsi simpan foto"
              style={{
                boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.25)',
              }}
            >
              <img
                src={imageUrl}
                alt="Hasil Photobooth"
                className="max-h-[64vh] max-w-full object-contain rounded-xl block shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Tag Hint di atas gambar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] text-white font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                ✨ {isIOS() ? 'Tekan & tahan untuk simpan ke Foto' : 'Hasil Foto HD'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <span className="animate-spin text-4xl">⏳</span>
              <span className="text-sm font-medium">Menyusun hasil photobooth...</span>
            </div>
          )}
        </section>

        {/* ── Right Column: Share & Download Action Panel */}
        <aside
          className="w-full lg:w-[440px] xl:w-[480px] flex flex-col border-t lg:border-t-0 lg:border-l p-4 md:p-6 space-y-5 overflow-y-auto"
          style={{
            background: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          {/* Header Info */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('result_title')}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('result_subtitle')}
            </p>
          </div>

          {/* Feedback Toast Salin */}
          {copyFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <span>✓</span>
              <span>{t('result_copied')}</span>
            </div>
          )}

          {/* ── Primary Action: Bagikan & QR Code ─────── */}
          <div className="space-y-2.5">
            {/* Primary Action Button */}
            <button
              id="btn-share-main"
              type="button"
              disabled={isSharing || !pngBlob}
              onClick={handleShare}
              className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <span>{isSharing ? '⏳' : '🚀'}</span>
              <span>{t('result_share_btn')}</span>
            </button>

            {/* QR Code & Email Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-get-qr-code"
                type="button"
                onClick={() => setShowQrModal(true)}
                className="py-3 px-3 rounded-2xl text-xs font-bold text-white transition-all duration-150 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 shadow-md"
              >
                <span>📱</span>
                <span>Dapatkan QR Code</span>
              </button>

              <button
                id="btn-send-email"
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="py-3 px-3 rounded-2xl text-xs font-bold text-gray-200 transition-all duration-150 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15"
              >
                <span>✉️</span>
                <span>Kirim ke Email</span>
              </button>
            </div>

            {/* Sub Share Buttons: WhatsApp & Copy */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-share-whatsapp"
                type="button"
                onClick={() => shareToWhatsApp()}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white transition-all duration-150 flex items-center justify-center gap-1.5 bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 border border-emerald-500/40"
              >
                <span>💬</span>
                <span>{t('result_share_wa')}</span>
              </button>

              <button
                id="btn-copy-clipboard"
                type="button"
                onClick={handleCopyImage}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-300 transition-all duration-150 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10"
              >
                <span>📋</span>
                <span>{t('result_copy_image')}</span>
              </button>
            </div>
          </div>

          {/* ── Section: Simpan ke Galeri & Unduh ──────── */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Opsi Simpan & Unduh
            </h3>

            {/* Simpan ke Galeri (Khusus Mobile / iOS Guide) */}
            <button
              id="btn-save-gallery"
              type="button"
              onClick={handleSaveToGallery}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-98 shadow-md"
            >
              <span>📸</span>
              <span>{t('result_save_gallery')}</span>
            </button>

            {/* Download Buttons PNG & JPG */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-download-png-result"
                type="button"
                disabled={isExporting}
                onClick={() => handleDownloadImage('image/png')}
                className="py-3 rounded-2xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center gap-1.5"
              >
                <span>📥</span>
                <span>Unduh PNG (HD)</span>
              </button>

              <button
                id="btn-download-jpg-result"
                type="button"
                disabled={isExporting}
                onClick={() => handleDownloadImage('image/jpeg')}
                className="py-3 rounded-2xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center gap-1.5"
              >
                <span>🖼️</span>
                <span>Unduh JPEG</span>
              </button>
            </div>

            {/* GIF Boomerang Download Button */}
            <button
              id="btn-download-gif-result"
              type="button"
              disabled={isGeneratingGif}
              onClick={() => handleDownloadGif('boomerang')}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 bg-pink-600/30 hover:bg-pink-600/40 border border-pink-500/40 text-pink-200 active:scale-98 disabled:opacity-50"
            >
              <span>🎬</span>
              <span>
                {isGeneratingGif
                  ? t('editor_gif_generating', { progress: gifProgress })
                  : 'Unduh Animasi GIF / Boomerang'}
              </span>
            </button>
          </div>

          {/* ── Section: Sesi Baru / Mulai Baru ────────── */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Sesi Berikutnya
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-retake-session-bottom"
                type="button"
                onClick={() => setShowConfirmRetakeModal(true)}
                className="py-3 rounded-2xl text-xs font-bold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🔄</span>
                <span>{t('result_btn_retake_session')}</span>
              </button>

              <button
                id="btn-new-session-bottom"
                type="button"
                onClick={() => setShowConfirmNewSessionModal(true)}
                className="py-3 rounded-2xl text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🏠</span>
                <span>{t('result_btn_new_session')}</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* ── MODAL: Panduan Khusus iPhone / iOS ───────── */}
      {showIosGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 bg-slate-900 border border-purple-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
              📱
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('result_save_ios_guide_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('result_save_ios_guide_desc')}
            </p>

            {/* Render gambar yang bisa ditekan lama */}
            {imageUrl && (
              <div className="p-2 bg-black/40 rounded-2xl border border-white/10 overflow-hidden max-h-[40vh] flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Tekan lama gambar ini"
                  className="max-h-[36vh] object-contain rounded-xl select-auto"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIosGuideModal(false)}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Konfirmasi Foto Lagi ──────────────── */}
      {showConfirmRetakeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/75 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 bg-slate-900 border border-rose-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl">
              📸
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('result_confirm_retake_title')}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('result_confirm_retake_desc')}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmRetakeModal(false)}
                className="py-3 rounded-xl text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/15 active:scale-95"
              >
                {t('result_confirm_cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmRetakeModal(false)
                  onRetakeSession()
                }}
                className="py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-lg shadow-rose-600/30"
              >
                {t('result_confirm_yes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Konfirmasi Mulai Baru ─────────────── */}
      {showConfirmNewSessionModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/75 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 bg-slate-900 border border-indigo-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl">
              🏠
            </div>
            <h3 className="text-lg font-bold text-white">
              Kembali ke Halaman Awal?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Kamu akan diarahkan ke halaman pembuka dan sesi saat ini akan direset.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmNewSessionModal(false)}
                className="py-3 rounded-xl text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/15 active:scale-95"
              >
                {t('result_confirm_cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmNewSessionModal(false)
                  onStartOver()
                }}
                className="py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/30"
              >
                Ya, Mulai Baru 🏠
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL: QR Code Modal ────────────────────── */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        blob={pngBlob}
        eventId={eventId}
        jenis="foto"
      />

      {/* ── MODAL: Kirim ke Email Modal ─────────────── */}
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        photoUrl={imageUrl}
      />
    </div>
  )
}
