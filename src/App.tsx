/**
 * App.tsx — Root aplikasi & routing dinamis (Tahap 8).
 * Rute:
 * - `/` : Photobooth Mandiri
 * - `/e/:slug` : Photobooth Bertema Event
 * - `/e/:slug?kiosk=1` : Mode Kiosk Tablet Event
 * - `/p/:id` : Halaman Publik Unduh Foto
 */

import { useState, useEffect, lazy, Suspense } from 'react'
import { InAppBrowserWarning } from './components/InAppBrowserWarning'
import { OfflineBanner } from './components/OfflineBanner'
import { ThemeLanguageHeader } from './components/ThemeLanguageHeader'
import { LegalModals } from './components/LegalModals'
import { PixelInstagramIcon } from './components/PixelInstagramIcon'
import { CameraPage } from './features/camera/CameraPage'
import { LandingPage } from './features/landing/LandingPage'
import { isInAppBrowser } from './lib/browserDetect'
import { useSessionStore } from './store/sessionStore'
import { useI18n } from './lib/i18n'
import {
  getEventBySlug,
  type PhotoboothEvent,
} from './lib/supabase'

// ── Lazy Loading Halaman Berat untuk Optimasi Performa & Bundle Chunks ──
const EditorPage = lazy(() =>
  import('./features/editor/EditorPage').then((m) => ({ default: m.EditorPage }))
)
const ResultPage = lazy(() =>
  import('./features/result/ResultPage').then((m) => ({ default: m.ResultPage }))
)
const PublicPhotoPage = lazy(() =>
  import('./features/public/PublicPhotoPage').then((m) => ({ default: m.PublicPhotoPage }))
)
const KioskMode = lazy(() =>
  import('./features/kiosk/KioskMode').then((m) => ({ default: m.KioskMode }))
)

function PageLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3 text-gray-400">
      <div
        className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{
          borderColor: 'var(--c-surface2)',
          borderTopColor: 'var(--c-primary)',
        }}
      />
      <span className="text-xs font-semibold">Memuat halaman…</span>
    </div>
  )
}

type Page =
  | 'landing'
  | 'camera'
  | 'editor'
  | 'result'
  | 'public_photo'
  | 'kiosk'

export default function App() {
  useI18n()
  const [page, setPage] = useState<Page>('landing')
  const [publicPhotoId, setPublicPhotoId] = useState<string>('')
  const [activeEvent, setActiveEvent] = useState<PhotoboothEvent | null>(null)
  const [composedCanvas, setComposedCanvas] = useState<HTMLCanvasElement | null>(null)
  const [eventAccessGranted, setEventAccessGranted] = useState<boolean>(true)
  const [enteredPasscode, setEnteredPasscode] = useState<string>('')
  const [passcodeError, setPasscodeError] = useState<boolean>(false)

  const showInAppWarning = isInAppBrowser()
  const { resetSession, setPhotoCount, setCountdownSecs } = useSessionStore()

  /* ── Parse Pathname & Query Routing ─────────────────── */
  useEffect(() => {
    const handleRoute = async () => {
      const pathname = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const isKioskMode = searchParams.get('kiosk') === '1'

      // 1. Rute Publik Unduh Foto: /p/:id
      const photoMatch = pathname.match(/^\/p\/([^/]+)/)
      if (photoMatch) {
        setPublicPhotoId(photoMatch[1])
        setPage('public_photo')
        return
      }

      // 3. Rute Event Photobooth: /e/:slug
      const eventMatch = pathname.match(/^\/e\/([^/]+)/)
      if (eventMatch) {
        const slug = eventMatch[1]
        try {
          const eventData = await getEventBySlug(slug)
          if (eventData) {
            setActiveEvent(eventData)

            // Terapkan pengaturan default dari event ke session store
            if (eventData.konfigurasi_frame.defaultPhotoCount) {
              setPhotoCount(eventData.konfigurasi_frame.defaultPhotoCount)
            }
            if (eventData.konfigurasi_frame.defaultCountdown) {
              setCountdownSecs(eventData.konfigurasi_frame.defaultCountdown)
            }

            // Cek apakah ada kode akses privat
            if (eventData.kode_akses) {
              setEventAccessGranted(false)
            } else {
              setEventAccessGranted(true)
            }

            if (isKioskMode && eventData.is_active) {
              setPage('kiosk')
            } else {
              setPage('landing')
            }
            return
          }
        } catch (err) {
          console.warn('Gagal memuat event:', err)
        }
      }

      // 4. Default Home
      setPage((curr) => (curr === 'public_photo' || curr === 'kiosk' ? 'landing' : curr))
    }

    handleRoute()
    window.addEventListener('popstate', handleRoute)
    return () => window.removeEventListener('popstate', handleRoute)
  }, [setPhotoCount, setCountdownSecs])

  const handleStartNewSession = () => {
    resetSession()
    setComposedCanvas(null)
    setPage('camera')
  }

  const handleStartOver = () => {
    resetSession()
    setComposedCanvas(null)
    window.history.pushState({}, '', activeEvent ? `/e/${activeEvent.slug}` : '/')
    setPage('landing')
  }

  const handleProceedToResult = (canvas: HTMLCanvasElement) => {
    setComposedCanvas(canvas)
    setPage('result')
  }

  const handleGoHomeFromPublic = () => {
    window.history.pushState({}, '', '/')
    setActiveEvent(null)
    setPage('landing')
  }

  // Verifikasi kode akses privat event
  const handleVerifyEventPasscode = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeEvent?.kode_akses && enteredPasscode === activeEvent.kode_akses) {
      setEventAccessGranted(true)
      setPasscodeError(false)
    } else {
      setPasscodeError(true)
    }
  }

  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null)

  return (
    <>
      {showInAppWarning && <InAppBrowserWarning />}
      <OfflineBanner />

      {/* Top Header Controls (Theme, Language, Install PWA) */}
      {page !== 'kiosk' && (
        <ThemeLanguageHeader
          onOpenPrivacy={() => setLegalModalType('privacy')}
          onOpenTerms={() => setLegalModalType('terms')}
        />
      )}

      <Suspense fallback={<PageLoadingSpinner />}>

        {/* ── 2. Rute Mode Kiosk Tablet (/e/:slug?kiosk=1) ─ */}
        {page === 'kiosk' && activeEvent && (
          <KioskMode
            event={activeEvent}
            onExitKiosk={() => {
              window.history.pushState({}, '', `/e/${activeEvent.slug}`)
              setPage('landing')
            }}
          />
        )}

        {/* ── 3. Rute Khusus: Publik Unduh Foto (/p/:id) ─── */}
        {page === 'public_photo' && (
          <PublicPhotoPage
            photoId={publicPhotoId}
            onGoHome={handleGoHomeFromPublic}
          />
        )}

        {/* ── 4. Tampilan Event Non-Aktif ───────────────── */}
        {activeEvent && !activeEvent.is_active && (page === 'landing' || page === 'camera') && (
          <div className="flex flex-col items-center justify-center min-h-[80dvh] p-6 text-center space-y-4" style={{ background: 'var(--c-bg)' }}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
              🔒
            </div>
            <h1 className="text-2xl font-black text-white">Event Ini Telah Ditutup</h1>
            <p className="text-xs text-gray-400 max-w-sm">
              Penyelenggara telah menonaktifkan photobooth untuk event <span className="text-white font-bold">{activeEvent.nama}</span>.
            </p>
            <button
              type="button"
              onClick={handleGoHomeFromPublic}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20"
            >
              Buka Photobooth Umum 📸
            </button>
          </div>
        )}

        {/* ── 5. Modal Kode Akses Privat Event ──────────── */}
        {activeEvent && activeEvent.is_active && !eventAccessGranted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <form
              onSubmit={handleVerifyEventPasscode}
              className="w-full max-w-sm rounded-3xl p-6 bg-slate-900 border border-white/20 text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                🔑
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Event Ini Memerlukan Kode Akses</h2>
                <p className="text-xs text-gray-400">
                  Masukkan kode akses untuk mengikuti photobooth {activeEvent.nama}.
                </p>
              </div>
              <input
                type="password"
                autoFocus
                value={enteredPasscode}
                onChange={(e) => {
                  setEnteredPasscode(e.target.value)
                  setPasscodeError(false)
                }}
                placeholder="Kode Akses Event"
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/20 text-white text-center text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 font-semibold">Kode akses salah.</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Masuk Photobooth 🚀
              </button>
            </form>
          </div>
        )}

        {/* ── 6. Rute Utama Photobooth ──────────────────── */}
        {page === 'landing' && (activeEvent ? activeEvent.is_active && eventAccessGranted : true) && (
          <LandingPage onStart={() => setPage('camera')} />
        )}

        {page === 'camera' && (activeEvent ? activeEvent.is_active && eventAccessGranted : true) && (
          <CameraPage
            onBack={() => setPage('landing')}
            onDone={() => setPage('editor')}
          />
        )}

        {page === 'editor' && (
          <EditorPage
            onBack={() => setPage('camera')}
            onNewSession={handleStartNewSession}
            onProceedToResult={handleProceedToResult}
          />
        )}

        {page === 'result' && (
          <ResultPage
            canvas={composedCanvas}
            onEditAgain={() => setPage('editor')}
            onRetakeSession={handleStartNewSession}
            onStartOver={handleStartOver}
            eventId={activeEvent?.id || null}
          />
        )}
      </Suspense>

      {/* Footer Legal & Creator Link */}
      {page === 'landing' && (
        <footer className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-6 text-xs text-gray-400 border-t border-white/5 mt-auto select-none">
          <a
            href="https://www.instagram.com/mhmmdrakak?stkn=dTI3endmN3NzZWh0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95 group"
            title="Instagram Creator KaaBooth: @mhmmdrakak"
          >
            <PixelInstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Creator KaaBooth: <strong className="text-[#00ff66] group-hover:text-[#00f0ff] font-mono">@mhmmdrakak</strong></span>
          </a>
          <span className="hidden sm:inline text-gray-600">•</span>
          <div className="flex items-center gap-3 text-gray-500">
            <button
              type="button"
              onClick={() => setLegalModalType('privacy')}
              className="hover:underline hover:text-gray-400 transition-colors"
            >
              Kebijakan Privasi
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLegalModalType('terms')}
              className="hover:underline hover:text-gray-400 transition-colors"
            >
              Syarat Penggunaan
            </button>
          </div>
        </footer>
      )}

      {/* Legal Modals (Privacy & Terms) */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </>
  )
}
