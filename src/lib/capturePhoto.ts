/**
 * lib/capturePhoto.ts
 * Mengambil frame dari video element ke Canvas.
 *
 * Fitur:
 * - Center-crop ke rasio aspek yang dipilih
 * - Output maks 1080px pada sisi terpanjang
 * - Hasil TIDAK mirror (foto asli, bukan selfie-mirror)
 * - Tidak mengirim data ke server
 */

import type { AspectRatio } from '../components/CameraPreview'

const RATIO_MAP: Record<AspectRatio, [number, number]> = {
  '3:4': [3, 4],
  '4:3': [4, 3],
  '1:1': [1, 1],
}

const MAX_LONG_SIDE = 1440

interface CropParams {
  sx: number
  sy: number
  sWidth: number
  sHeight: number
}

function getCropParams(
  videoW: number,
  videoH: number,
  ratioW: number,
  ratioH: number,
): CropParams {
  const targetRatio = ratioW / ratioH
  const videoRatio = videoW / videoH

  let sx: number, sy: number, sWidth: number, sHeight: number

  if (videoRatio > targetRatio) {
    // Video lebih lebar dari target → potong sisi kiri-kanan
    sHeight = videoH
    sWidth = videoH * targetRatio
    sx = (videoW - sWidth) / 2
    sy = 0
  } else {
    // Video lebih tinggi dari target → potong atas-bawah
    sWidth = videoW
    sHeight = videoW / targetRatio
    sx = 0
    sy = (videoH - sHeight) / 2
  }

  return { sx, sy, sWidth, sHeight }
}

/**
 * Capture satu frame dari video ke canvas, kembalikan sebagai dataURL JPEG.
 * @param video     HTMLVideoElement yang sedang streaming
 * @param aspectRatio  Rasio yang dipilih user
 * @returns dataURL (image/jpeg, quality 0.92)
 * @throws Error jika video tidak siap atau canvas tidak tersedia
 */
export function capturePhoto(
  video: HTMLVideoElement,
  aspectRatio: AspectRatio,
): string {
  const vw = video.videoWidth
  const vh = video.videoHeight

  if (!vw || !vh) {
    throw new Error('Video belum siap: dimensi tidak tersedia')
  }

  const [rw, rh] = RATIO_MAP[aspectRatio]
  const { sx, sy, sWidth, sHeight } = getCropParams(vw, vh, rw, rh)

  // Scale output agar sisi panjang tidak melebihi MAX_LONG_SIDE
  const scale = Math.min(MAX_LONG_SIDE / Math.max(sWidth, sHeight), 1)
  const canvasW = Math.round(sWidth * scale)
  const canvasH = Math.round(sHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia')

  // Gambar video ke canvas TANPA transform → hasil tidak mirror
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasW, canvasH)

  return canvas.toDataURL('image/jpeg', 0.92)
}
