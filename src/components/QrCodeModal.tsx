/**
 * components/QrCodeModal.tsx
 * Modal QR Code dengan persetujuan unggah eksplisit (Explicit Consent).
 * - Menampilkan dialog persetujuan sebelum upload ke Supabase
 * - Mengunggah file (maks 8MB) ke cloud
 * - Menampilkan QR Code besar yang siap di-scan dari HP lain untuk mengakses /p/:id
 */

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  uploadPhotoboothPhoto,
  isSupabaseConfigured,
  type UploadPhotoResult,
} from '../lib/supabase'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  blob: Blob | null
  eventId?: string | null
  jenis?: 'foto' | 'gif'
}

export function QrCodeModal({
  isOpen,
  onClose,
  blob,
  eventId = null,
  jenis = 'foto',
}: QrCodeModalProps) {
  const [hasConsented, setHasConsented] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadResult, setUploadResult] = useState<UploadPhotoResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  if (!isOpen) return null

  const handleStartUpload = async () => {
    if (!blob) {
      setErrorMessage('Gambar tidak ditemukan.')
      return
    }

    try {
      setErrorMessage('')
      setIsUploading(true)
      setHasConsented(true)

      const result = await uploadPhotoboothPhoto(blob, eventId, jenis)
      setUploadResult(result)
    } catch (err) {
      console.error('Error saat upload untuk QR:', err)
      const msg = (err as Error).message || 'Gagal mengunggah foto ke cloud.'
      setErrorMessage(msg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!uploadResult?.shareUrl) return
    try {
      await navigator.clipboard.writeText(uploadResult.shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      alert('Gagal menyalin tautan.')
    }
  }

  const handleResetAndClose = () => {
    onClose()
    // Reset state jika ditutup
    setTimeout(() => {
      setHasConsented(false)
      setIsUploading(false)
      setErrorMessage('')
    }, 200)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 md:p-7 space-y-5 shadow-2xl border text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1e1b2e 0%, #12111d 100%)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.2)',
        }}
      >
        {/* Tombol Close (X) */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>

        {/* ── STEP 1: PERSETUJUAN EKSPLISIT (CONSENT) ──── */}
        {!hasConsented && !uploadResult && (
          <div className="space-y-4 pt-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
              📱
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                Dapatkan QR Code Unduh
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Scan QR Code dari kamera HP lain untuk langsung membuka dan menyimpan foto ini.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
              <div className="flex items-start gap-2 text-xs text-gray-300">
                <span>☁️</span>
                <span>
                  Foto akan diunggah sementara ke cloud Supabase Storage (Maks 8 MB).
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-300">
                <span>⏳</span>
                <span>
                  Foto akan otomatis dihapus permanen setelah masa retensi 7 hari.
                </span>
              </div>
            </div>

            {!isSupabaseConfigured() && (
              <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                ⚠️ Supabase belum diatur di .env. Foto akan diunggah ke storage cloud setelah kunci API diisi.
              </p>
            )}

            <div className="pt-2 space-y-2">
              <button
                id="btn-confirm-upload-qr"
                type="button"
                onClick={handleStartUpload}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <span>Setuju & Unggah Foto ☁️</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Batalkan
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PROSES UPLOAD ───────────────────── */}
        {isUploading && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Mengunggah Foto ke Cloud…
              </h3>
              <p className="text-xs text-gray-400">
                Menghasilkan QR code dan link publik yang aman.
              </p>
            </div>
          </div>
        )}

        {/* ── ERROR MESSAGE ────────────────────────────── */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-3">
            <p className="font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setHasConsented(false)
                setErrorMessage('')
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── STEP 3: QR CODE SELESAI ─────────────────── */}
        {uploadResult && !isUploading && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white tracking-tight">
                Scan untuk Unduh Foto 📸
              </h2>
              <p className="text-xs text-gray-300">
                Arahkan kamera smartphone ke kode QR di bawah:
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-3xl mx-auto inline-block shadow-2xl border-4 border-indigo-500/30">
              <QRCodeSVG
                value={uploadResult.shareUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Link Preview & Copy Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-left">
                <input
                  type="text"
                  readOnly
                  value={uploadResult.shareUrl}
                  className="bg-transparent text-[11px] text-gray-300 flex-1 outline-none font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95"
                >
                  {copiedLink ? '✓ Tersalin' : 'Salin'}
                </button>
              </div>

              <a
                href={uploadResult.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-indigo-300 hover:text-indigo-200 underline font-medium"
              >
                Buka Halaman Unduh Publik ↗
              </a>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 transition-all"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
