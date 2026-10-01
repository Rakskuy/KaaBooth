/**
 * features/kiosk/KioskMode.tsx
 * Mode Kiosk Layar Penuh Otomatis untuk Tablet / Stand Photobooth Event.
 * Fitur:
 * - Layar penuh & Screen Wake Lock API (cegah layar mati)
 * - Alur otomatis: Layar Sambut → Kamera & Countdown → Hasil & QR Code Otomatis
 * - Auto-reset timer 30 detik tanpa aktivitas (kembali ke layar awal secara bersih)
 * - Tombol besar ramah sentuh untuk tablet
 * - Kunci keluar Kiosk dengan PIN Admin
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCamera } from '../../hooks/useCamera'
import { CameraPreview } from '../../components/CameraPreview'
import { CountdownOverlay } from '../../components/CountdownOverlay'
import { FlashOverlay } from '../../components/FlashOverlay'
import { playShutter } from '../../lib/shutterSound'
import { capturePhoto } from '../../lib/capturePhoto'
import {
  composePhotobooth,
  exportCanvasAsBlob,
  getDefaultDateString,
  type CustomTextOptions,
} from '../../lib/composer'
import { getLayoutById } from '../../assets/layouts'
import { getFrameById } from '../../assets/frames'
import {
  uploadPhotoboothPhoto,
  type PhotoboothEvent,
} from '../../lib/supabase'

interface KioskModeProps {
  event: PhotoboothEvent
  onExitKiosk: () => void
}

type KioskPhase = 'welcome' | 'countdown' | 'capturing' | 'pausing' | 'result'

const AUTO_RESET_TIMEOUT_SECS = 30

export function KioskMode({ event, onExitKiosk }: KioskModeProps) {
  const [phase, setPhase] = useState<KioskPhase>('welcome')
  const [countdownNum, setCountdownNum] = useState<number>(3)
  const [showFlash, setShowFlash] = useState<boolean>(false)
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState<number>(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])

  // Result & QR state
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [autoResetSecsLeft, setAutoResetSecsLeft] = useState<number>(AUTO_RESET_TIMEOUT_SECS)

  // PIN Admin Exit Modal
  const [showPinModal, setShowPinModal] = useState<boolean>(false)
  const [enteredPin, setEnteredPin] = useState<string>('')
  const [pinError, setPinError] = useState<boolean>(false)

  // Camera hook
  const { videoRef, facingMode, retryCamera } = useCamera('user')
  const wakeLockRef = useRef<any>(null)
  const autoResetTimerRef = useRef<any>(null)

  const totalPhotos = event.konfigurasi_frame.defaultPhotoCount || 4
  const countdownDuration = event.konfigurasi_frame.defaultCountdown || 3

  /* ── 1. Screen Wake Lock API (Cegah layar mati) ────── */
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        }
      } catch (err) {
        console.warn('Wake Lock tidak didukung / ditolak:', err)
      }
    }

    requestWakeLock()

    // Coba request fullscreen jika didukung
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => null)
      }
    } catch {}

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => null)
      }
    }
  }, [])

  /* ── 2. Reset Bersih Sesi Kiosk ────────────────────── */
  const resetKioskSession = useCallback(() => {
    setPhase('welcome')
    setCapturedPhotos([])
    setCurrentPhotoIdx(0)
    setResultCanvas(null)
    setQrUrl('')
    setIsUploading(false)
    setAutoResetSecsLeft(AUTO_RESET_TIMEOUT_SECS)
    if (autoResetTimerRef.current) clearInterval(autoResetTimerRef.current)
  }, [])

  /* ── 3. Mulai Sesi Foto Baru ───────────────────────── */
  const handleStartKioskSession = () => {
    setCapturedPhotos([])
    setCurrentPhotoIdx(0)
    setPhase('countdown')
    setCountdownNum(countdownDuration)
    retryCamera()
  }

  /* ── 4. Komposisi & Auto Upload QR ─────────────────── */
  const composeAndUploadResult = useCallback(async (photos: string[]) => {
    const layout = getLayoutById(
      photos.length === 1 ? 'single' : photos.length === 3 ? 'vertical-3' : 'vertical-4'
    )
    const frame = getFrameById(event.konfigurasi_frame.frameId || 'clean')

    const textOptions: CustomTextOptions = {
      title: event.konfigurasi_frame.title || event.nama,
      showDate: event.konfigurasi_frame.showDate !== false,
      dateString: getDefaultDateString(),
      fontFamily: event.konfigurasi_frame.fontFamily || 'Outfit',
      textColor: event.konfigurasi_frame.textColor || '#ffffff',
    }

    try {
      const canvas = await composePhotobooth({
        photos,
        layout,
        frame,
        backgroundColor: event.konfigurasi_frame.backgroundColor || '#121218',
        customText: textOptions,
        logo: event.konfigurasi_frame.logoUrl,
        mirror: false,
        watermark: {
          enabled: event.konfigurasi_frame.showWatermark ?? false,
          text: event.konfigurasi_frame.watermarkText || event.nama,
        },
      })

      setResultCanvas(canvas)

      // Auto upload ke Supabase untuk menghasilkan QR code
      setIsUploading(true)
      const blob = await exportCanvasAsBlob(canvas, 'image/png', 0.96)
      const uploadRes = await uploadPhotoboothPhoto(blob, event.id, 'foto')
      setQrUrl(uploadRes.shareUrl)
    } catch (err) {
      console.warn('Gagal upload otomatis di kiosk:', err)
    } finally {
      setIsUploading(false)
    }
  }, [event])

  /* ── 5. Alur Countdown & Pengambilan Foto Berulang ─── */
  useEffect(() => {
    if (phase !== 'countdown') return

    if (countdownNum > 0) {
      const timer = setTimeout(() => {
        setCountdownNum((c) => c - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }

    // Saat hitungan mundur 0 -> Ambil foto
    if (countdownNum === 0) {
      setShowFlash(true)
      playShutter()

      const captureTimer = setTimeout(() => {
        setShowFlash(false)
        if (videoRef.current) {
          const photoDataUrl = capturePhoto(videoRef.current, '3:4')
          const newPhotos = [...capturedPhotos, photoDataUrl]
          setCapturedPhotos(newPhotos)

          const nextIdx = currentPhotoIdx + 1
          if (nextIdx < totalPhotos) {
            // Masih ada foto berikutnya -> jeda 1.5 detik lalu countdown lagi
            setCurrentPhotoIdx(nextIdx)
            setPhase('pausing')
            setTimeout(() => {
              setCountdownNum(countdownDuration)
              setPhase('countdown')
            }, 1500)
          } else {
            // Semua foto sudah diambil -> lanjut ke hasil & QR
            setPhase('result')
            void composeAndUploadResult(newPhotos)
          }
        }
      }, 150)
      return () => clearTimeout(captureTimer)
    }
  }, [
    phase,
    countdownNum,
    currentPhotoIdx,
    totalPhotos,
    countdownDuration,
    capturedPhotos,
    composeAndUploadResult,
    videoRef,
  ])

  /* ── 6. Timer Auto-Reset 30 Detik pada Layar Hasil ──── */
  useEffect(() => {
    if (phase !== 'result') return

    setAutoResetSecsLeft(AUTO_RESET_TIMEOUT_SECS)
    autoResetTimerRef.current = setInterval(() => {
      setAutoResetSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(autoResetTimerRef.current)
          resetKioskSession()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      if (autoResetTimerRef.current) clearInterval(autoResetTimerRef.current)
    }
  }, [phase, resetKioskSession])

  const handleTouchExtendReset = () => {
    setAutoResetSecsLeft(AUTO_RESET_TIMEOUT_SECS)
  }

  /* ── 7. Verifikasi PIN Keluar Kiosk ────────────────── */
  const handleVerifyPin = () => {
    const targetPin = event.pin_kiosk || '1234'
    if (enteredPin === targetPin) {
      resetKioskSession()
      onExitKiosk()
    } else {
      setPinError(true)
      setEnteredPin('')
    }
  }

  return (
    <div
      onClick={handleTouchExtendReset}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden touch-manipulation"
      style={{
        background: 'radial-gradient(circle at center, #1a162b 0%, #09080e 100%)',
      }}
    >
      {/* ── Top Bar: Branding & Tombol Kunci Keluar ───── */}
      <header className="w-full flex items-center justify-between px-6 py-4 z-20">
        <div className="flex items-center gap-3">
          {event.konfigurasi_frame.logoUrl ? (
            <img
              src={event.konfigurasi_frame.logoUrl}
              alt="Logo"
              className="h-10 max-w-[120px] object-contain"
            />
          ) : (
            <span className="text-2xl">📸</span>
          )}
          <span className="text-lg md:text-xl font-black text-white tracking-tight">
            {event.nama}
          </span>
        </div>

        {/* Tombol Kunci Keluar Kiosk */}
        <button
          type="button"
          onClick={() => {
            setShowPinModal(true)
            setEnteredPin('')
            setPinError(false)
          }}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          title="Keluar Mode Kiosk (Perlu PIN)"
        >
          🔒
        </button>
      </header>

      {/* ── 1. LAYAR SAMBUT (WELCOME SCREEN) ──────────── */}
      {phase === 'welcome' && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3 max-w-md">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Photobooth Kiosk Experience
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {event.konfigurasi_frame.title || event.nama}
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Ambil foto kenanganmu sekarang dan langsung simpan ke HP lewat QR Code!
            </p>
          </div>

          <button
            id="btn-kiosk-start"
            type="button"
            onClick={handleStartKioskSession}
            className="w-full max-w-md py-6 rounded-3xl text-xl md:text-2xl font-black text-white transition-all transform hover:scale-[1.03] active:scale-[0.97] shadow-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
              boxShadow: '0 0 60px rgba(99, 102, 241, 0.4), var(--shadow-glow)',
            }}
          >
            Sentuh untuk Mulai Foto 📸
          </button>
        </main>
      )}

      {/* ── 2. SESI KAMERA & COUNTDOWN ────────────────── */}
      {(phase === 'countdown' || phase === 'capturing' || phase === 'pausing') && (
        <main className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
          <div className="relative w-full max-w-2xl h-[75vh] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <CameraPreview
              videoRef={videoRef}
              facingMode={facingMode}
              aspectRatio="3:4"
            />

            {/* Countdown Overlay */}
            {(phase === 'countdown' || phase === 'pausing') && (
              <CountdownOverlay
                phase={phase === 'countdown' ? 'countdown' : 'pausing'}
                countdown={countdownNum}
                photoIndex={currentPhotoIdx}
                photoCount={totalPhotos}
              />
            )}

            {/* Flash Effect */}
            <FlashOverlay isVisible={showFlash} />

            {/* Status Info Sesi di Kiosk */}
            <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>
                Foto {currentPhotoIdx + 1} dari {totalPhotos}
              </span>
            </div>
          </div>
        </main>
      )}

      {/* ── 3. HASIL FOTO & QR CODE OTOMATIS ──────────── */}
      {phase === 'result' && (
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 gap-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
          {/* Left: Preview Canvas */}
          {resultCanvas && (
            <div
              className="relative max-h-[68vh] rounded-2xl p-2 bg-slate-900 border border-white/20 shadow-2xl flex items-center justify-center"
              style={{
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.25)',
              }}
            >
              <img
                src={resultCanvas.toDataURL('image/png')}
                alt="Hasil Kiosk"
                className="max-h-[60vh] max-w-full object-contain rounded-xl block"
              />
            </div>
          )}

          {/* Right: QR Code & Auto-Reset Timer */}
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Scan untuk Simpan ke HP 📱
              </h2>
              <p className="text-xs text-gray-400">
                Arahkan kamera smartphone ke kode QR di bawah:
              </p>
            </div>

            {/* QR Code Card */}
            <div className="p-5 bg-white rounded-3xl mx-auto inline-block shadow-2xl border-4 border-indigo-500/40">
              {isUploading ? (
                <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-gray-800">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
                  <span className="text-xs font-bold">Membuat QR…</span>
                </div>
              ) : qrUrl ? (
                <QRCodeSVG value={qrUrl} size={190} level="M" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-500 text-xs text-center p-2">
                  Foto tersimpan lokal
                </div>
              )}
            </div>

            {/* Auto-Reset Countdown Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Reset otomatis</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {autoResetSecsLeft}s
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-1000"
                  style={{
                    width: `${(autoResetSecsLeft / AUTO_RESET_TIMEOUT_SECS) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Big Finish Button */}
            <button
              id="btn-kiosk-finish"
              type="button"
              onClick={resetKioskSession}
              className="w-full py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg"
            >
              Selesai & Sesi Berikutnya ✨
            </button>
          </div>
        </main>
      )}

      {/* ── MODAL: PIN KELUAR KIOSK ───────────────────── */}
      {showPinModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-xs rounded-3xl p-6 bg-slate-900 border border-white/20 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
              🔒
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Keluar Mode Kiosk
              </h3>
              <p className="text-xs text-gray-400">
                Masukkan PIN Admin untuk keluar ke dashboard.
              </p>
            </div>

            <input
              type="password"
              autoFocus
              maxLength={6}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value)
                setPinError(false)
              }}
              placeholder="PIN Admin (Default: 1234)"
              className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/20 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-indigo-500"
            />

            {pinError && (
              <p className="text-xs text-rose-400 font-semibold">
                PIN salah. Silakan coba lagi.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/20"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                className="py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
