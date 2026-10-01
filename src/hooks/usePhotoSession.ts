/**
 * hooks/usePhotoSession.ts
 * Orchestrator state machine untuk sesi foto.
 *
 * Diagram transisi:
 *  settings → countdown → capturing → pausing → countdown (berikutnya)
 *                                             → review (semua selesai / retake selesai)
 *  review   → done  (lanjut ke editor)
 *  *        → settings (cancel / reset)
 *
 * Prinsip:
 * - Zustand store menyimpan state permanen (phase, photos, settings)
 * - Hook ini mengelola side-effect timer dan countdown display
 * - Refs digunakan di dalam setTimeout agar tidak stale closure
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { capturePhoto } from '../lib/capturePhoto'
import { playShutter } from '../lib/shutterSound'
import type { FacingMode } from './useCamera'
import { useSessionStore } from '../store/sessionStore'

export interface UsePhotoSessionReturn {
  /** Angka countdown saat ini (ditampilkan di UI) */
  countdown: number
  /** Apakah efek flash putih sedang aktif */
  isFlashing: boolean
  /** Batalkan sesi, kembali ke settings */
  cancelSession: () => void
}

type StoreSnapshot = {
  currentIndex: number
  photoCount: number
  countdownSecs: number
  aspectRatio: Parameters<typeof capturePhoto>[1]
  isSoundEnabled: boolean
  retakeIndex: number | null
}

export function usePhotoSession(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  _facingMode: FacingMode,
  stream?: MediaStream | null,
): UsePhotoSessionReturn {
  const store = useSessionStore()

  const [countdown, setCountdown] = useState<number>(store.countdownSecs)
  const [isFlashing, setIsFlashing] = useState(false)

  /* Ref snapshot — selalu up-to-date, aman dipakai dalam timeout */
  const snap = useRef<StoreSnapshot>({
    currentIndex: store.currentIndex,
    photoCount: store.photoCount,
    countdownSecs: store.countdownSecs,
    aspectRatio: store.aspectRatio,
    isSoundEnabled: store.isSoundEnabled,
    retakeIndex: store.retakeIndex,
  })

  /* Effect pertama: selalu sync ref (runs before phase effect) */
  useEffect(() => {
    snap.current = {
      currentIndex: store.currentIndex,
      photoCount: store.photoCount,
      countdownSecs: store.countdownSecs,
      aspectRatio: store.aspectRatio,
      isSoundEnabled: store.isSoundEnabled,
      retakeIndex: store.retakeIndex,
    }
  })

  /* Timer refs */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
  }, [])

  /* ── Mesin State ───────────────────────────────────── */
  useEffect(() => {
    clearTimers()
    const { setPhase, setCurrentIndex, setRetakeIndex, setPhoto } =
      useSessionStore.getState()

    /* ── COUNTDOWN ─────────────────────────────── */
    if (store.phase === 'countdown') {
      const secs = snap.current.countdownSecs
      setCountdown(secs)
      let remaining = secs

      intervalRef.current = setInterval(() => {
        remaining -= 1
        if (remaining <= 0) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setCountdown(0)
          setPhase('capturing')
        } else {
          setCountdown(remaining)
        }
      }, 1000)
    }

    /* ── CAPTURING ─────────────────────────────── */
    if (store.phase === 'capturing') {
      setIsFlashing(true)

      try {
        const video = videoRef.current
        if (video) {
          if (stream && video.srcObject !== stream) {
            video.srcObject = stream
          }
          if (video.paused) {
            video.play().catch(() => {})
          }
          const dataUrl = capturePhoto(video, snap.current.aspectRatio)
          setPhoto(snap.current.currentIndex, dataUrl)
          if (snap.current.isSoundEnabled) playShutter()
        }
      } catch (err) {
        console.error('[SnapBooth] Gagal capture:', err)
      }

      timeoutRef.current = setTimeout(() => {
        setIsFlashing(false)
        setPhase('pausing')
      }, 650)
    }

    /* ── PAUSING ───────────────────────────────── */
    if (store.phase === 'pausing') {
      timeoutRef.current = setTimeout(() => {
        const { currentIndex, photoCount, retakeIndex } = snap.current

        if (retakeIndex !== null) {
          /* Selesai retake satu foto → kembali ke review */
          setRetakeIndex(null)
          setPhase('review')
        } else if (currentIndex + 1 < photoCount) {
          /* Masih ada foto berikutnya */
          setCurrentIndex(currentIndex + 1)
          setPhase('countdown')
        } else {
          /* Semua foto selesai */
          setPhase('review')
        }
      }, 1300)
    }

    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.phase])

  /* Cleanup saat unmount */
  useEffect(() => () => clearTimers(), [clearTimers])

  const cancelSession = useCallback(() => {
    clearTimers()
    useSessionStore.getState().resetSession()
  }, [clearTimers])

  return { countdown, isFlashing, cancelSession }
}
