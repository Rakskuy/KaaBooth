/**
 * hooks/useCamera.ts
 * Mengelola akses kamera lewat getUserMedia.
 *
 * Status kamera:
 *  'idle'        – belum diminta
 *  'loading'     – sedang meminta izin / inisialisasi stream
 *  'ready'       – stream aktif, video berjalan
 *  'denied'      – izin ditolak user atau sistem
 *  'no-camera'   – perangkat tidak memiliki kamera
 *  'unsupported' – browser tidak mendukung getUserMedia
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { hasMultipleCameras } from '../lib/browserDetect'

export type CameraStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'no-camera' | 'unsupported'
export type FacingMode = 'user' | 'environment'

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  status: CameraStatus
  facingMode: FacingMode
  canSwitch: boolean
  switchCamera: () => void
  retryCamera: () => void
  stream: MediaStream | null
}

const IDEAL_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function useCamera(initialFacing: FacingMode = 'user'): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacing)
  const [canSwitch, setCanSwitch] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = useCallback(
    async (facing: FacingMode) => {
      // Cek dukungan API
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }

      setStatus('loading')
      stopStream(streamRef.current)
      streamRef.current = null
      setStream(null)

      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            ...IDEAL_CONSTRAINTS,
            facingMode: { ideal: facing },
          },
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = mediaStream
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          // Tunggu video siap sebelum play (penting untuk Safari)
          await new Promise<void>((resolve) => {
            if (!videoRef.current) return resolve()
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(() => {})
              resolve()
            }
          })
        }

        setStatus('ready')

        // Cek apakah bisa switch kamera (setelah izin diberikan)
        const multi = await hasMultipleCameras()
        setCanSwitch(multi)
      } catch (err: unknown) {
        const error = err as DOMException
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError'
        ) {
          setStatus('denied')
        } else if (
          error.name === 'NotFoundError' ||
          error.name === 'DevicesNotFoundError' ||
          error.name === 'OverconstrainedError'
        ) {
          // OverconstrainedError: resolusi tidak cocok – coba fallback tanpa constraint
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: { facingMode: { ideal: facing } },
            })
            streamRef.current = fallbackStream
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream
              await new Promise<void>((resolve) => {
                if (!videoRef.current) return resolve()
                videoRef.current.onloadedmetadata = () => {
                  videoRef.current?.play().catch(() => {})
                  resolve()
                }
              })
            }
            setStatus('ready')
            const multi = await hasMultipleCameras()
            setCanSwitch(multi)
          } catch {
            setStatus('no-camera')
          }
        } else {
          setStatus('no-camera')
        }
      }
    },
    [],
  )

  // Jalankan kamera saat mount atau facingMode berubah
  useEffect(() => {
    startCamera(facingMode)

    // Tangani tab backgrounding / foregrounding (iOS Safari & Chrome Android)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTracks = streamRef.current?.getVideoTracks() || []
        const isTrackDead = currentTracks.length === 0 || currentTracks.some((t) => t.readyState === 'ended' || t.muted)
        if (isTrackDead) {
          startCamera(facingMode)
        }
      }
    }

    // Tangani perubahan perangkat kamera (colok/cabut webcam)
    const handleDeviceChange = () => {
      hasMultipleCameras().then((multi) => setCanSwitch(multi))
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
      }
      stopStream(streamRef.current)
      streamRef.current = null
      setStream(null)
    }
  }, [facingMode, startCamera])

  // Pastikan elemen video selalu terhubung ke stream saat di-mount ulang di DOM
  useEffect(() => {
    const video = videoRef.current
    const activeStream = stream || streamRef.current
    if (video && activeStream && video.srcObject !== activeStream) {
      video.srcObject = activeStream
      video.play().catch(() => {})
    }
  })

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [])

  const retryCamera = useCallback(() => {
    startCamera(facingMode)
  }, [facingMode, startCamera])

  return {
    videoRef,
    status,
    facingMode,
    canSwitch,
    switchCamera,
    retryCamera,
    stream,
  }
}
