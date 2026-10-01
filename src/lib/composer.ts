/**
 * lib/composer.ts
 * Engine Komposisi Kanvas Photobooth (Tahap 4).
 * - Mendukung layout slot, frame overlay, background kustom, teks tanggal/judul, logo acara
 * - Mendukung filter visual (Normal, B&W, Sepia, Vintage, Cerah, Film Grain, Dingin) & slider penyesuaian (Brightness, Contrast, Saturation, Skin Smoothing)
 * - Kompatibel penuh di Safari, iOS, Chrome, Android (Pixel Processing Native)
 * - Mendukung rendering Stiker & Emoji dalam koordinat relatif presisi tinggi
 */

import type { LayoutConfig, PhotoSlot } from '../assets/layouts'
import type { FrameConfig } from '../assets/frames'
import type { PhotoFilterOptions } from './photoFilters'
import { processImageDataWithFilters, DEFAULT_FILTER_OPTIONS } from './photoFilters'
import type { StickerItem } from '../types/sticker'

export interface CustomTextOptions {
  title: string
  showDate: boolean
  dateString?: string
  fontFamily: string
  textColor: string
}

export interface ComposeOptions {
  photos: (string | null)[]
  layout: LayoutConfig
  frame: FrameConfig | null
  backgroundColor: string
  customText: CustomTextOptions
  logo?: string | null
  mirror?: boolean
  filterOptions?: PhotoFilterOptions
  stickers?: StickerItem[]
  watermark?: {
    enabled: boolean
    text?: string
  }
}

/**
 * Helper untuk memuat Image dari dataURL/URL secara Promise
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(new Error(`Gagal memuat gambar: ${err}`))
    img.src = src
  })
}

/**
 * Format tanggal hari ini dalam format DD.MM.YYYY
 */
export function getDefaultDateString(): string {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Menggambar satu foto ke dalam slot dengan mode 'cover' + filter & penyesuaian
 */
function drawPhotoInSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  slot: PhotoSlot,
  canvasWidth: number,
  canvasHeight: number,
  mirror: boolean,
  slotIndex: number,
  filterOptions?: PhotoFilterOptions
) {
  const x = (slot.x / 100) * canvasWidth
  const y = (slot.y / 100) * canvasHeight
  const w = (slot.width / 100) * canvasWidth
  const h = (slot.height / 100) * canvasHeight
  const r = slot.borderRadius || 16

  ctx.save()

  // 1. Clip area slot dengan rounded rect
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.clip()

  if (img) {
    // 2. Hitung cover crop aspect ratio
    const imgAspect = img.width / img.height
    const slotAspect = w / h

    let drawW: number
    let drawH: number
    let drawX: number
    let drawY: number

    if (imgAspect > slotAspect) {
      drawH = h
      drawW = h * imgAspect
      drawX = x - (drawW - w) / 2
      drawY = y
    } else {
      drawW = w
      drawH = w / imgAspect
      drawX = x
      drawY = y - (drawH - h) / 2
    }

    // 3. Buat slot canvas sementara jika ada filter atau mirror
    const slotCanvas = document.createElement('canvas')
    slotCanvas.width = Math.round(w)
    slotCanvas.height = Math.round(h)
    const slotCtx = slotCanvas.getContext('2d', { willReadFrequently: true })

    if (slotCtx) {
      // Offset koordinat relatif terhadap slot canvas
      const relDrawX = drawX - x
      const relDrawY = drawY - y

      if (mirror) {
        slotCtx.save()
        slotCtx.translate(w / 2, 0)
        slotCtx.scale(-1, 1)
        slotCtx.translate(-w / 2, 0)
      }

      slotCtx.drawImage(img, relDrawX, relDrawY, drawW, drawH)

      if (mirror) {
        slotCtx.restore()
      }

      // 4. Terapkan pemrosesan pixel filter jika ada penyesuaian aktif
      if (filterOptions) {
        const hasActiveFilter =
          filterOptions.preset !== 'normal' ||
          filterOptions.brightness !== 0 ||
          filterOptions.contrast !== 0 ||
          filterOptions.saturation !== 0 ||
          filterOptions.smoothSkin !== 0

        if (hasActiveFilter) {
          const imgData = slotCtx.getImageData(0, 0, slotCanvas.width, slotCanvas.height)
          processImageDataWithFilters(imgData, filterOptions)
          slotCtx.putImageData(imgData, 0, 0)
        }
      }

      // Gambar hasil slot yang sudah difilter ke kanvas utama
      ctx.drawImage(slotCanvas, x, y)
    } else {
      // Direct fallback
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }
  } else {
    // Placeholder untuk slot kosong
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.fillRect(x, y, w, h)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = `bold ${Math.max(24, canvasWidth * 0.03)}px Outfit, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Foto ${slotIndex + 1}`, x + w / 2, y + h / 2)
  }

  ctx.restore()
}

/**
 * Menggambar teks kustom (Judul & Tanggal) di area textSlot
 */
function drawCustomText(
  ctx: CanvasRenderingContext2D,
  options: CustomTextOptions,
  layout: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
) {
  const { title, showDate, dateString, fontFamily, textColor } = options
  const textSlot = layout.textSlot
  const tx = (textSlot.x / 100) * canvasWidth
  const ty = (textSlot.y / 100) * canvasHeight
  const tw = (textSlot.width / 100) * canvasWidth
  const th = (textSlot.height / 100) * canvasHeight

  ctx.save()
  ctx.fillStyle = textColor
  ctx.textAlign = textSlot.align || 'center'
  ctx.textBaseline = 'middle'

  const centerX = textSlot.align === 'center' ? tx + tw / 2 : tx

  const baseTitleSize = Math.max(22, canvasWidth * 0.038)
  const dateSize = Math.max(16, canvasWidth * 0.024)

  if (title.trim() && showDate) {
    const displayDate = dateString || getDefaultDateString()

    ctx.font = `bold ${baseTitleSize}px "${fontFamily}", sans-serif`
    ctx.fillText(title, centerX, ty + th * 0.35, tw)

    ctx.font = `500 ${dateSize}px "${fontFamily}", sans-serif`
    ctx.globalAlpha = 0.8
    ctx.fillText(displayDate, centerX, ty + th * 0.8, tw)
  } else if (title.trim()) {
    ctx.font = `bold ${baseTitleSize * 1.1}px "${fontFamily}", sans-serif`
    ctx.fillText(title, centerX, ty + th * 0.5, tw)
  } else if (showDate) {
    const displayDate = dateString || getDefaultDateString()
    ctx.font = `600 ${dateSize * 1.2}px "${fontFamily}", sans-serif`
    ctx.fillText(displayDate, centerX, ty + th * 0.5, tw)
  }

  ctx.restore()
}

/**
 * Menggambar stiker dan emoji ke Canvas
 */
async function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: StickerItem[],
  canvasWidth: number,
  canvasHeight: number
) {
  for (const sticker of stickers) {
    const pxX = sticker.x * canvasWidth
    const pxY = sticker.y * canvasHeight
    const baseSize = Math.max(48, canvasWidth * 0.15) * sticker.scale

    ctx.save()
    ctx.translate(pxX, pxY)
    ctx.rotate((sticker.rotation * Math.PI) / 180)

    if (sticker.type === 'emoji') {
      const fontSize = Math.round(baseSize * 0.8)
      ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(sticker.content, 0, 0)
    } else if (sticker.type === 'svg') {
      try {
        const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sticker.content)}`
        const svgImg = await loadImage(svgUrl)
        ctx.drawImage(svgImg, -baseSize / 2, -baseSize / 2, baseSize, baseSize)
      } catch (err) {
        console.warn('Gagal merender stiker SVG:', err)
      }
    }

    ctx.restore()
  }
}

/**
 * Menggambar logo opsional di area logoSlot
 */
async function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoSrc: string | null | undefined,
  layout: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!logoSrc || !layout.logoSlot) return

  try {
    const logoImg = await loadImage(logoSrc)
    const slot = layout.logoSlot
    const sx = (slot.x / 100) * canvasWidth
    const sy = (slot.y / 100) * canvasHeight
    const sw = (slot.width / 100) * canvasWidth
    const sh = (slot.height / 100) * canvasHeight

    const imgAspect = logoImg.width / logoImg.height
    const slotAspect = sw / sh

    let drawW: number
    let drawH: number

    if (imgAspect > slotAspect) {
      drawW = sw
      drawH = sw / imgAspect
    } else {
      drawH = sh
      drawW = sh * imgAspect
    }

    const drawX = sx + (sw - drawW) / 2
    const drawY = sy + (sh - drawH) / 2

    ctx.save()
    ctx.drawImage(logoImg, drawX, drawY, drawW, drawH)
    ctx.restore()
  } catch (err) {
    console.warn('Gagal menggambar logo ke canvas:', err)
  }
}

/**
 * Menggambar watermark halus di sudut kanvas
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  watermarkText: string,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!watermarkText.trim()) return

  ctx.save()
  const fontSize = Math.max(12, Math.round(canvasWidth * 0.018))
  ctx.font = `600 ${fontSize}px "Outfit", sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  const paddingX = canvasWidth * 0.03
  const paddingY = canvasHeight * 0.02
  ctx.fillText(watermarkText, canvasWidth - paddingX, canvasHeight - paddingY)
  ctx.restore()
}

/**
 * ENGINE UTAMA: Komposisi photobooth ke Canvas
 */
export async function composePhotobooth(options: ComposeOptions): Promise<HTMLCanvasElement> {
  const {
    photos,
    layout,
    frame,
    backgroundColor,
    customText,
    logo,
    mirror = false,
    filterOptions = DEFAULT_FILTER_OPTIONS,
    stickers = [],
    watermark,
  } = options

  // 1. Buat kanvas dengan resolusi tinggi dari layout
  const canvas = document.createElement('canvas')
  canvas.width = layout.canvasWidth
  canvas.height = layout.canvasHeight

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('Gagal mendapatkan 2D Context dari Canvas')
  }

  // 2. Gambar background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3. Muat semua foto
  const loadedPhotos = await Promise.all(
    layout.slots.map(async (_, idx) => {
      const photoSrc = photos[idx]
      if (!photoSrc) return null
      try {
        return await loadImage(photoSrc)
      } catch (err) {
        console.warn(`Gagal memuat foto index ${idx}:`, err)
        return null
      }
    })
  )

  // 4. Gambar foto ke setiap slot dengan filter & penyesuaian
  layout.slots.forEach((slot, idx) => {
    drawPhotoInSlot(
      ctx,
      loadedPhotos[idx],
      slot,
      canvas.width,
      canvas.height,
      mirror,
      idx,
      filterOptions
    )
  })

  // 5. Gambar frame overlay
  if (frame && typeof frame.drawOverlay === 'function') {
    frame.drawOverlay(ctx, canvas.width, canvas.height, layout)
  }

  // 6. Gambar teks kustom
  drawCustomText(ctx, customText, layout, canvas.width, canvas.height)

  // 7. Gambar logo jika ada
  if (logo) {
    await drawLogo(ctx, logo, layout, canvas.width, canvas.height)
  }

  // 8. Gambar stiker & emoji
  if (stickers.length > 0) {
    await drawStickers(ctx, stickers, canvas.width, canvas.height)
  }

  // 9. Gambar Watermark jika aktif
  if (watermark?.enabled && watermark.text) {
    drawWatermark(ctx, watermark.text, canvas.width, canvas.height)
  }

  return canvas
}

/**
 * Ekspor Canvas ke format Blob (PNG atau JPEG)
 */
export function exportCanvasAsBlob(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Gagal mengonversi Canvas ke Blob'))
        }
      },
      format,
      quality
    )
  })
}

/**
 * Generate nama file standar: photobooth-YYYYMMDD-HHmmss
 */
export function generatePhotoboothFilename(extension: 'png' | 'jpg' | 'gif' = 'png'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `photobooth-${year}${month}${date}-${hours}${minutes}${seconds}.${extension}`
}

/**
 * Helper download cross-browser (Chrome Android, Safari iOS, Desktop)
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1000)
}
