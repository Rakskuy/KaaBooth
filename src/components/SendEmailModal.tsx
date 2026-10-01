/**
 * components/SendEmailModal.tsx
 * Modal Kirim Hasil Foto ke Email (Tahap 6).
 * - Menyiapkan antarmuka dan struktur data email
 * - Terhubung modular dengan API Resend / Supabase Edge Functions
 */

import { useState } from 'react'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  photoId?: string
}

export function SendEmailModal({
  isOpen,
  onClose,
  photoUrl,
  photoId,
}: SendEmailModalProps) {
  const [email, setEmail] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  if (!isOpen) return null

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      setError('Format email tidak valid.')
      return
    }

    try {
      setIsSending(true)

      // Struktur payload siap dikirim ke Supabase Edge Function atau Resend API
      const payload = {
        to: email,
        subject: 'Foto Photobooth Kamu dari KaBooth 📸✨',
        photoUrl: photoUrl || '',
        downloadUrl: photoId ? `${window.location.origin}/p/${photoId}` : window.location.href,
      }
      
      // Simulasi request pengiriman email:
      if (import.meta.env.DEV) {
        console.info('Mengirim email photobooth dengan payload:', payload)
      }

      // Delay simulasi 1 detik
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSuccess(true)
    } catch (err) {
      console.error('Gagal mengirim email:', err)
      setError('Gagal mengirim email. Silakan coba lagi.')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setEmail('')
      setIsSuccess(false)
      setError('')
      setIsSending(false)
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
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center text-xs transition-colors"
        >
          ✕
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSendEmail} className="space-y-4 pt-2 text-left">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                ✉️
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Kirim Foto ke Email
              </h2>
              <p className="text-xs text-gray-300">
                Masukkan emailmu untuk menerima salinan foto dan tautan unduhan HD.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 block">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <span>{isSending ? '⏳' : '✉️'}</span>
                <span>{isSending ? 'Mengirim Email…' : 'Kirim Sekarang'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Email Terkirim!</h3>
              <p className="text-xs text-gray-300">
                Tautan foto photobooth telah dikirim ke <span className="text-indigo-300 font-semibold">{email}</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
