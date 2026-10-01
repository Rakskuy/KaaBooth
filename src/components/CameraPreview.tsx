/**
 * components/CameraPreview.tsx
 * Menampilkan video stream dari kamera.
 * - Mirror otomatis untuk kamera depan (CSS)
 * - Rasio aspek bisa diatur
 * - playsInline + muted wajib untuk autoplay di Safari iOS
 */

import React from 'react'
import type { FacingMode } from '../hooks/useCamera'

export type AspectRatio = '3:4' | '4:3' | '1:1'

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  facingMode: FacingMode
  aspectRatio?: AspectRatio
  className?: string
  stream?: MediaStream | null
  children?: React.ReactNode
}

const RATIO_MAP: Record<AspectRatio, string> = {
  '3:4': '3 / 4',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
}

export function CameraPreview({
  videoRef,
  facingMode,
  aspectRatio = '3:4',
  className = '',
  stream,
  children,
}: CameraPreviewProps) {
  const isFront = facingMode === 'user'

  React.useEffect(() => {
    const video = videoRef.current
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream
      video.play().catch(() => {})
    }
  }, [videoRef, stream])

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-2xl bg-black transition-all duration-300 ease-in-out ${className}`}
      style={{
        aspectRatio: RATIO_MAP[aspectRatio] || '3 / 4',
      }}
    >
      <video
        ref={videoRef}
        id="camera-video"
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          // Mirror kamera depan hanya pada PREVIEW (bukan saat capture)
          transform: isFront ? 'scaleX(-1)' : 'none',
          transition: 'transform 0.3s ease',
        }}
      />
      {children}
    </div>
  )
}

