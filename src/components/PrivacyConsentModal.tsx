/**
 * components/PrivacyConsentModal.tsx
 * Dialog persetujuan privasi sebelum sesi pertama.
 */

interface PrivacyConsentModalProps {
  isOpen: boolean
  onAccept: () => void
}

export function PrivacyConsentModal({ isOpen, onAccept }: PrivacyConsentModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1e1b2e 0%, #12111d 100%)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.2)',
        }}
      >
        {/* Glow ambient header */}
        <div
          aria-hidden="true"
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
        />

        {/* Icon Lock & Shield */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/30 border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>

        <div className="space-y-2">
          <h2
            id="privacy-consent-title"
            className="text-xl md:text-2xl font-black text-white tracking-tight"
          >
            Privasi & Keamanan Kamu
          </h2>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Sebelum memulai sesi foto, ketahui bagaimana data dan fotomu dilindungi:
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-lg">🛡️</span>
            <div>
              <h3 className="text-xs font-bold text-white">100% Pemrosesan di Perangkat</h3>
              <p className="text-[11px] text-gray-400">
                Semua foto, efek filter, dan rendering kanvas diproses langsung di browser kamu (*client-side*).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-lg">🚫</span>
            <div>
              <h3 className="text-xs font-bold text-white">Tanpa Pengiriman ke Server</h3>
              <p className="text-[11px] text-gray-400">
                Foto dan data kamera tidak pernah dikirim, disimpan, atau dianalisis di server mana pun.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-lg">✨</span>
            <div>
              <h3 className="text-xs font-bold text-white">Hak Milik Penuh</h3>
              <p className="text-[11px] text-gray-400">
                Hasil fotomu bebas diunduh dan dibagikan sesukamu tanpa batasan.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            id="btn-accept-privacy"
            type="button"
            onClick={onAccept}
            className="w-full py-4 rounded-2xl text-sm md:text-base font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <span>Mulai Foto Sekarang 📸</span>
          </button>
        </div>
      </div>
    </div>
  )
}
