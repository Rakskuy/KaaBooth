/**
 * features/public/PublicPhotoPage.tsx
 * Halaman Publik Unduh Foto / GIF (/p/:id) (Tahap 6).
 * - Tanpa login / otentikasi
 * - Menampilkan foto resolusi penuh & branding event
 * - Tombol Simpan ke Galeri, Unduh HD, dan Bagikan
 */

import { useState, useEffect } from 'react'
import {
  getPhotoById,
  getPublicStorageUrl,
  type PhotoboothPhoto,
} from '../../lib/supabase'
import {
  sharePhotoboothFile,
  shareToWhatsApp,
  copyImageToClipboard,
} from '../../lib/shareHelper'
import { isIOS } from '../../lib/browserDetect'
import { downloadFile, generatePhotoboothFilename } from '../../lib/composer'

interface PublicPhotoPageProps {
  photoId: string
  onGoHome: () => void
}

export function PublicPhotoPage({ photoId, onGoHome }: PublicPhotoPageProps) {
  const [photo, setPhoto] = useState<PhotoboothPhoto | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false)
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false)

  useEffect(() => {
    let isCancelled = false

    getPhotoById(photoId)
      .then((data) => {
        if (isCancelled) return
        if (data) {
          setPhoto(data)
        } else {
          setErrorMessage('Foto tidak ditemukan atau telah melewati batas waktu retensi.')
        }
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error fetching photo:', err)
          setErrorMessage('Gagal memuat foto. Periksa koneksi internetmu.')
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [photoId])

  const photoUrl = photo ? getPublicStorageUrl(photo.storage_path) : ''

  /* ── Handler Unduh Langsung ────────────────────────── */
  const handleDownloadDirect = async () => {
    if (!photoUrl) return
    try {
      const resp = await fetch(photoUrl)
      const blob = await resp.blob()
      const ext = photo?.jenis === 'gif' ? 'gif' : 'png'
      const filename = generatePhotoboothFilename(ext)
      downloadFile(blob, filename)
    } catch (err) {
      console.error('Gagal unduh gambar:', err)
      // Fallback buka URL di tab baru
      window.open(photoUrl, '_blank')
    }
  }

  /* ── Handler Share ─────────────────────────────────── */
  const handleShare = async () => {
    if (!photoUrl) return
    try {
      const resp = await fetch(photoUrl)
      const blob = await resp.blob()
      const ext = photo?.jenis === 'gif' ? 'gif' : 'png'
      const filename = generatePhotoboothFilename(ext)

      const shared = await sharePhotoboothFile({
        blob,
        filename,
        title: photo?.event?.nama ? `Foto ${photo.event.nama}` : 'KaBooth Moments',
        text: 'Lihat fotoku dari KaBooth! 📸✨',
      })

      if (!shared) {
        shareToWhatsApp(`Lihat fotoku di KaBooth: ${window.location.href} 📸✨`)
      }
    } catch {
      shareToWhatsApp(`Lihat fotoku di KaBooth: ${window.location.href} 📸✨`)
    }
  }

  /* ── Handler Salin Gambar ──────────────────────────── */
  const handleCopy = async () => {
    if (!photoUrl) return
    try {
      const resp = await fetch(photoUrl)
      const blob = await resp.blob()
      const success = await copyImageToClipboard(blob)
      if (success) {
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 2500)
      } else {
        alert('Browser tidak mendukung salin gambar langsung. Gunakan tombol Unduh atau Bagikan.')
      }
    } catch {
      alert('Gagal menyalin gambar.')
    }
  }

  /* ── Handler Simpan Galeri ─────────────────────────── */
  const handleSaveGallery = () => {
    if (isIOS()) {
      setShowIosGuide(true)
    } else {
      handleDownloadDirect()
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
        <div className="flex items-center gap-2">
          <span className="text-xl">📸</span>
          <span className="font-extrabold text-white text-base tracking-tight">
            KaBooth
          </span>

        </div>

        <button
          type="button"
          onClick={onGoHome}
          className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
        >
          Buat Fotomu Sendiri ✨
        </button>
      </header>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-sm font-semibold text-gray-300">
              Memuat foto photobooth…
            </p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl">
              🔍
            </div>
            <h2 className="text-xl font-bold text-white">Foto Tidak Ditemukan</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={onGoHome}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Mulai Sesi Photobooth Baru 📸
            </button>
          </div>
        )}

        {!isLoading && photo && photoUrl && (
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 w-full justify-center">
            {/* Left: Preview Foto */}
            <div
              className="relative max-w-full max-h-[70vh] rounded-2xl p-2 transition-all duration-300 group cursor-pointer"
              onClick={handleSaveGallery}
              style={{
                boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.25)',
              }}
            >
              <img
                src={photoUrl}
                alt="Foto Photobooth"
                className="max-h-[62vh] max-w-full object-contain rounded-xl block shadow-2xl"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] text-white font-medium opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ✨ {isIOS() ? 'Tekan & tahan untuk simpan ke Foto' : 'Ketuk untuk simpan'}
              </div>
            </div>

            {/* Right: Actions & Info */}
            <div className="w-full max-w-sm space-y-5 text-left">
              {/* Event Badge (Jika ada) */}
              {photo.event && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Event Photobooth
                  </span>
                  <h2 className="text-base font-bold text-white">
                    {photo.event.nama}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {photo.event.tanggal}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Simpan & Bagikan Kenangan 📸
                </h1>
                <p className="text-xs text-gray-400">
                  Foto tersimpan dalam kualitas resolusi tinggi.
                </p>
              </div>

              {copyFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>Gambar berhasil disalin ke clipboard!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleSaveGallery}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <span>📸</span>
                  <span>Simpan ke Galeri / Foto</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadDirect}
                    className="py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex items-center justify-center gap-1.5"
                  >
                    <span>📥</span>
                    <span>Unduh File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>🚀</span>
                    <span>Bagikan</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center gap-1.5"
                >
                  <span>📋</span>
                  <span>Salin Gambar ke Clipboard</span>
                </button>
              </div>

              {/* Promo Banner */}
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={onGoHome}
                  className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold underline"
                >
                  Buat sesi foto photobooth sendiri gratis 📸
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: Panduan Khusus iPhone / iOS ───────── */}
      {showIosGuide && (
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
              Cara Simpan ke Foto iPhone/iPad
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Tekan dan tahan gambar di bawah selama 1-2 detik, lalu pilih menu <span className="font-bold text-indigo-300">"Simpan ke Foto" (Save to Photos)</span>.
            </p>

            {photoUrl && (
              <div className="p-2 bg-black/40 rounded-2xl border border-white/10 overflow-hidden max-h-[40vh] flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Tekan lama gambar ini"
                  className="max-h-[36vh] object-contain rounded-xl select-auto"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
