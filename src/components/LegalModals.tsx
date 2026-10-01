/**
 * components/LegalModals.tsx
 * Modal Kebijakan Privasi dan Syarat & Ketentuan Penggunaan (Tahap 8).
 */

import { useI18n } from '../lib/i18n'

interface LegalModalProps {
  type: 'privacy' | 'terms' | null
  onClose: () => void
}

export function LegalModals({ type, onClose }: LegalModalProps) {
  const { t, locale } = useI18n()

  if (!type) return null

  const isPrivacy = type === 'privacy'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl border text-left my-auto max-h-[85vh] flex flex-col"
        style={{
          background: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
          color: 'var(--c-text)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isPrivacy ? '🔒' : '📜'}</span>
            <h2 id="legal-modal-title" className="text-lg md:text-xl font-black tracking-tight">
              {isPrivacy ? t('legal_privacy_title') : t('legal_terms_title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('legal_close')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs md:text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
          {isPrivacy ? (
            locale === 'id' ? (
              <>
                <p>
                  <strong className="text-white block mb-1">1. Pemrosesan Data di Perangkat Lokal (Client-Side)</strong>
                  KaBooth dirancang dengan prinsip privasi utama. Seluruh proses pengambilan foto, filter, penghalusan kulit, stiker, dan pembuatan strip foto diproses 100% langsung di peramban (browser) perangkat Anda. Foto tidak dikirim ke server mana pun secara otomatis.
                </p>
                <p>
                  <strong className="text-white block mb-1">2. Akses Kamera Hardware</strong>
                  Izin kamera hanya digunakan saat sesi photobooth aktif untuk menampilkan pratinjau langsung dan mengambil pose foto. Kami tidak merekam audio maupun menyimpan video stream di luar sesi foto.
                </p>
                <p>
                  <strong className="text-white block mb-1">3. Layanan Berbagi Cloud & QR Code (Opsional)</strong>
                  Jika Anda memilih untuk membagikan foto via QR Code, hasil foto akhir akan diunggah ke penyimpanan cloud Supabase yang terenkripsi dan dapat diunduh melalui tautan unik. Foto pada event akan dihapus secara otomatis sesuai masa retensi yang ditetapkan oleh penyelenggara event (default 7 hari).
                </p>
                <p>
                  <strong className="text-white block mb-1">4. Hak Pengguna</strong>
                  Anda berhak menghapus sesi foto Anda kapan saja sebelum mengunggah, atau meminta penghapusan foto event melalui penyelenggara acara.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-white block mb-1">1. Local Device Processing (Client-Side)</strong>
                  KaBooth is built privacy-first. All photo capturing, filters, skin smoothing, stickers, and photobooth strip rendering occur 100% on your device browser. No photos are transmitted to external servers without your explicit consent.
                </p>
                <p>
                  <strong className="text-white block mb-1">2. Camera Hardware Permissions</strong>
                  Camera permission is only used during active photobooth sessions to render live view and capture photo poses. We do not record audio or save video streams.
                </p>
                <p>
                  <strong className="text-white block mb-1">3. Optional Cloud Sharing & QR Codes</strong>
                  When you explicitly choose to share your photo via QR code, the finalized image is uploaded to encrypted Supabase cloud storage and made accessible via a unique download URL. Event photos are automatically purged after the retention period (default 7 days).
                </p>
                <p>
                  <strong className="text-white block mb-1">4. User Rights</strong>
                  You can reset or discard your photos at any time, or request photo deletion via your event administrator.
                </p>
              </>
            )
          ) : (
            locale === 'id' ? (
              <>
                <p>
                  <strong className="text-white block mb-1">1. Ketentuan Penggunaan Layanan</strong>
                  Dengan menggunakan KaBooth, Anda setuju untuk menggunakan layanan ini untuk keperluan yang sah, hiburan acara, dan tidak melanggar hak cipta atau privasi orang lain.
                </p>
                <p>
                  <strong className="text-white block mb-1">2. Hak Cipta & Konten</strong>
                  Hak cipta atas seluruh foto yang diambil tetap menjadi milik pengguna atau penyelenggara acara terkait. KaBooth tidak mengklaim kepemilikan atas foto yang Anda buat.
                </p>
                <p>
                  <strong className="text-white block mb-1">3. Batasan Tanggung Jawab</strong>
                  Layanan ini disediakan "apa adanya" (as is). KaBooth tidak bertanggung jawab atas kehilangan data sementara yang disebabkan oleh gangguan jaringan pengguna atau kegagalan perangkat keras lokal.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-white block mb-1">1. Acceptance of Terms</strong>
                  By using KaBooth, you agree to utilize this service for lawful entertainment purposes without infringing on intellectual property or third-party privacy.
                </p>
                <p>
                  <strong className="text-white block mb-1">2. Ownership & Intellectual Property</strong>
                  You and your event organizers retain complete ownership and rights over photos captured in KaBooth. KaBooth does not claim ownership over any user content.
                </p>
                <p>
                  <strong className="text-white block mb-1">3. Limitation of Liability</strong>
                  The service is provided "as is" without warranty. KaBooth is not liable for temporary data loss resulting from network issues or local browser termination.
                </p>
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--c-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-500 active:scale-95"
          >
            {t('legal_close')}
          </button>
        </div>
      </div>
    </div>
  )
}
