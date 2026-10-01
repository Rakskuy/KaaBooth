/**
 * lib/gifGenerator.ts
 * Generator Animasi GIF & Boomerang menggunakan gifenc.
 *
 * Mengapa memilih `gifenc` daripada `gif.js`:
 * 1. Zero external worker dependency: `gif.js` memerlukan file worker.js terpisah di public folder yang sering gagal dimuat (404/CORS) di bundler modern seperti Vite.
 * 2. Ukuran sangat ringan: `gifenc` hanya berukuran ~5 KB tanpa overhead WebWorker rumit.
 * 3. Kualitas & Kompresi Optimal: Menggunakan adaptive palette quantization (256 warna) yang menghasilkan file GIF jernih dan ukuran file sangat efisien (jauh di bawah 5 MB, rata-rata 600KB - 2MB).
 * 4. Kompatibilitas Tinggi: Berjalan mulus di Chrome, Safari iOS, dan Android browser.
 */

import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { PhotoFilterOptions } from './photoFilters'
import { processImageDataWithFilters } from './photoFilters'
import type { StickerItem } from '../types/sticker'

export type GifMode = 'sequence' | 'boomerang'

export interface GifGeneratorOptions {
  photos: (string | null)[]
  filterOptions: PhotoFilterOptions
  stickers: StickerItem[]
  mode: GifMode
  delayMs?: number // Delay per frame dalam milidetik (misal 350ms)
  maxWidth?: number // Resolusi maksimal untuk menjaga ukuran file < 5MB (default: 600px)
  onProgress?: (progress: number) => void // 0..100
}

/**
 * Helper untuk memuat Image dari dataURL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(new Error(`Gagal memuat gambar GIF: ${err}`))
    img.src = src
  })
}

/**
 * Menggambar stiker ke dalam canvas frame tunggal
 */
function drawStickerOnFrame(
  ctx: CanvasRenderingContext2D,
  sticker: StickerItem,
  frameWidth: number,
  frameHeight: number
) {
  const pxX = sticker.x * frameWidth
  const pxY = sticker.y * frameHeight
  const baseSize = Math.max(36, frameWidth * 0.15) * sticker.scale

  ctx.save()
  ctx.translate(pxX, pxY)
  ctx.rotate((sticker.rotation * Math.PI) / 180)

  if (sticker.type === 'emoji') {
    ctx.font = `${Math.round(baseSize * 0.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sticker.content, 0, 0)
  }

  ctx.restore()
}

/**
 * Generate file GIF atau Boomerang dari foto-foto sesi
 */
export async function generateSessionGif(
  options: GifGeneratorOptions
): Promise<{ blob: Blob; sizeBytes: number; frameCount: number }> {
  const {
    photos,
    filterOptions,
    stickers,
    mode,
    delayMs = 350,
    maxWidth = 600,
    onProgress,
  } = options

  // Ambil hanya foto yang valid
  const validPhotoUrls = photos.filter((p): p is string => Boolean(p))
  if (validPhotoUrls.length === 0) {
    throw new Error('Tidak ada foto untuk membuat GIF')
  }

  // 1. Muat semua gambar
  const loadedImages = await Promise.all(
    validPhotoUrls.map((url) => loadImage(url))
  )

  // 2. Tentukan dimensi frame seragam
  const firstImg = loadedImages[0]
  const targetWidth = Math.min(maxWidth, firstImg.width || 600)
  const targetHeight = Math.round((targetWidth * (firstImg.height || 800)) / (firstImg.width || 600))

  // 3. Susun urutan frame (Sequence vs Boomerang)
  const frameIndices: number[] = []
  const count = loadedImages.length

  if (mode === 'boomerang') {
    // Maju: 0, 1, 2, 3 ...
    for (let i = 0; i < count; i++) frameIndices.push(i)
    // Mundur: 2, 1 (jangan duplikasi ujung agar loop mulus)
    for (let i = count - 2; i > 0; i--) frameIndices.push(i)
  } else {
    // Mode normal sequence
    for (let i = 0; i < count; i++) frameIndices.push(i)
  }

  // 4. Inisialisasi GIFEncoder
  const gif = GIFEncoder()
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    throw new Error('Gagal menginisialisasi 2D context untuk GIF')
  }

  const totalFrames = frameIndices.length

  // 5. Render setiap frame & tulis ke GIF
  for (let fIdx = 0; fIdx < totalFrames; fIdx++) {
    const img = loadedImages[frameIndices[fIdx]]

    ctx.clearRect(0, 0, targetWidth, targetHeight)

    // A. Gambar foto dengan cover aspect ratio
    const imgAspect = img.width / img.height
    const targetAspect = targetWidth / targetHeight
    let dw = targetWidth
    let dh = targetHeight
    let dx = 0
    let dy = 0

    if (imgAspect > targetAspect) {
      dw = targetHeight * imgAspect
      dx = -(dw - targetWidth) / 2
    } else {
      dh = targetWidth / imgAspect
      dy = -(dh - targetHeight) / 2
    }

    ctx.drawImage(img, dx, dy, dw, dh)

    // B. Terapkan filter & penyesuaian
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight)
    processImageDataWithFilters(imgData, filterOptions)
    ctx.putImageData(imgData, 0, 0)

    // C. Gambar stiker di atas frame
    stickers.forEach((sticker) => {
      drawStickerOnFrame(ctx, sticker, targetWidth, targetHeight)
    })

    // D. Quantize ke 256 palet warna dan encode frame
    const frameData = ctx.getImageData(0, 0, targetWidth, targetHeight).data
    const palette = quantize(frameData, 256)
    const index = applyPalette(frameData, palette)

    gif.writeFrame(index, targetWidth, targetHeight, {
      palette,
      delay: delayMs,
      repeat: 0, // 0 = loop selamanya
    })

    if (onProgress) {
      onProgress(Math.round(((fIdx + 1) / totalFrames) * 100))
    }
  }

  // 6. Selesaikan GIF dan konversi ke Blob
  gif.finish()
  const buffer = gif.bytes()
  const blob = new Blob([buffer.slice().buffer], { type: 'image/gif' })

  return {
    blob,
    sizeBytes: blob.size,
    frameCount: totalFrames,
  }
}
