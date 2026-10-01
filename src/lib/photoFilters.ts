/**
 * lib/photoFilters.ts
 * Engine Filter & Penyesuaian Foto Photobooth (Tahap 4).
 * - Pemrosesan Pixel Presisi (Safari & Chrome Cross-Browser 100% Kompatibel)
 * - Filter Siap Pakai: Normal, Hitam-Putih, Sepia, Vintage, Cerah, Film (Grain + Warm), Dingin
 * - Penyesuaian: Kecerahan, Kontras, Saturasi
 * - Efek "Haluskan Kulit" Alami (Subtle edge-preserving blend, bukan topeng plastik)
 */

export type FilterPresetId =
  | 'normal'
  | 'bw'
  | 'sepia'
  | 'vintage'
  | 'bright'
  | 'film'
  | 'cool'

export interface PhotoFilterOptions {
  preset: FilterPresetId
  brightness: number // -50 s/d +50 (default: 0)
  contrast: number // -50 s/d +50 (default: 0)
  saturation: number // -50 s/d +50 (default: 0)
  smoothSkin: number // 0 s/d 100 (default: 0)
}

export const DEFAULT_FILTER_OPTIONS: PhotoFilterOptions = {
  preset: 'normal',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  smoothSkin: 0,
}

export interface FilterPresetInfo {
  id: FilterPresetId
  name: string
  description: string
  icon: string
}

export const FILTER_PRESETS: FilterPresetInfo[] = [
  { id: 'normal', name: 'Normal', description: 'Warna asli natural', icon: '✨' },
  { id: 'bw', name: 'Hitam-Putih', description: 'Monokrom klasik kontras tinggi', icon: '🖤' },
  { id: 'sepia', name: 'Sepia', description: 'Nuansa cokelat hangat nostalgia', icon: '📜' },
  { id: 'vintage', name: 'Vintage', description: 'Retro 90s matte & warm tone', icon: '🎞️' },
  { id: 'bright', name: 'Cerah', description: 'Vibrant, jernih & glowing', icon: '🌟' },
  { id: 'film', name: 'Film', description: 'Analog film grain & warm vibes', icon: '📽️' },
  { id: 'cool', name: 'Dingin', description: 'Sejuk, modern & blue tone', icon: '❄️' },
]

/**
 * Clamp nilai antara min dan max
 */
function clamp(val: number, min = 0, max = 255): number {
  return val < min ? min : val > max ? max : val
}

/**
 * Fast Box Blur untuk efek haluskan kulit ringan
 */
function boxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length)
  const len = data.length

  // Salin alfa
  for (let i = 3; i < len; i += 4) {
    output[i] = data[i]
  }

  const r = Math.max(1, Math.round(radius))
  const winSize = 2 * r + 1

  // Horizontal pass
  const temp = new Uint8ClampedArray(len)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4

    for (let c = 0; c < 3; c++) {
      let sum = 0

      // Inisialisasi sum jendela awal
      for (let i = -r; i <= r; i++) {
        const px = clamp(i, 0, width - 1)
        sum += data[rowOffset + px * 4 + c]
      }

      for (let x = 0; x < width; x++) {
        temp[rowOffset + x * 4 + c] = Math.round(sum / winSize)

        const leftPx = clamp(x - r, 0, width - 1)
        const rightPx = clamp(x + r + 1, 0, width - 1)
        sum += data[rowOffset + rightPx * 4 + c] - data[rowOffset + leftPx * 4 + c]
      }
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0

      for (let i = -r; i <= r; i++) {
        const py = clamp(i, 0, height - 1)
        sum += temp[(py * width + x) * 4 + c]
      }

      for (let y = 0; y < height; y++) {
        output[(y * width + x) * 4 + c] = Math.round(sum / winSize)

        const topPy = clamp(y - r, 0, height - 1)
        const bottomPy = clamp(y + r + 1, 0, height - 1)
        sum += temp[(bottomPy * width + x) * 4 + c] - temp[(topPy * width + x) * 4 + c]
      }
    }
  }

  return output
}

/**
 * Memproses ImageData secara langsung untuk konsistensi di Safari, iOS, Chrome, Android.
 */
export function processImageDataWithFilters(
  imgData: ImageData,
  options: PhotoFilterOptions
): ImageData {
  const { preset, brightness, contrast, saturation, smoothSkin } = options
  const data = imgData.data
  const width = imgData.width
  const height = imgData.height
  const totalPixels = width * height

  // 1. Hitung faktor penyesuaian
  // Brightness: -50..+50 -> -60..+60 offset
  const bOffset = (brightness / 50) * 60

  // Contrast: -50..+50 -> 0.5..1.6 multiplier
  const cFactor = contrast >= 0 ? 1 + (contrast / 50) * 0.7 : 1 + (contrast / 50) * 0.5

  // Saturation: -50..+50 -> 0.0..2.0
  const sFactor = saturation >= 0 ? 1 + (saturation / 50) * 1.0 : 1 + (saturation / 50) * 1.0

  // 2. Haluskan Kulit (Edge-Preserving Subtle Smoothing)
  let blurredData: Uint8ClampedArray | null = null
  const skinIntensity = smoothSkin > 0 ? (smoothSkin / 100) * 0.65 : 0

  if (skinIntensity > 0) {
    // Radius adaptif proporsional terhadap ukuran gambar (misal 2 s/d 5px)
    const blurRadius = Math.max(2, Math.min(6, Math.round(width * 0.004)))
    blurredData = boxBlur(data, width, height, blurRadius)
  }

  // 3. Iterasi setiap pixel
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    let r = data[idx]
    let g = data[idx + 1]
    let b = data[idx + 2]

    // ── A. Terapkan Skin Smoothing (jika aktif) ──────
    if (blurredData && skinIntensity > 0) {
      const br = blurredData[idx]
      const bg = blurredData[idx + 1]
      const bb = blurredData[idx + 2]

      // Hitung selisih luminansi untuk mempertahankan tepi tajam (mata, rambut, bibir)
      const origLum = 0.299 * r + 0.587 * g + 0.114 * b
      const blurLum = 0.299 * br + 0.587 * bg + 0.114 * bb
      const edgeDiff = Math.abs(origLum - blurLum)

      // Hanya haluskan jika perbedaan kecil (area kulit datar / gradien halus)
      const blendWeight = skinIntensity * Math.max(0, 1 - edgeDiff / 32)

      r = Math.round(r * (1 - blendWeight) + br * blendWeight)
      g = Math.round(g * (1 - blendWeight) + bg * blendWeight)
      b = Math.round(b * (1 - blendWeight) + bb * blendWeight)
    }

    // ── B. Terapkan Filter Preset ────────────────────
    switch (preset) {
      case 'bw': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        // Tambahkan sedikit kurva kontras monokrom
        const highContGray = (gray - 128) * 1.15 + 128
        r = g = b = clamp(highContGray)
        break
      }

      case 'sepia': {
        const sr = r * 0.393 + g * 0.769 + b * 0.189
        const sg = r * 0.349 + g * 0.686 + b * 0.168
        const sb = r * 0.272 + g * 0.534 + b * 0.131
        r = clamp(sr)
        g = clamp(sg)
        b = clamp(sb)
        break
      }

      case 'vintage': {
        // Retro tone: matte shadow, warm midtone, slight magenta
        r = clamp(r * 1.1 + 15)
        g = clamp(g * 0.95 + 10)
        b = clamp(b * 0.8 + 20)
        // Fade blacks
        r = Math.max(20, r)
        g = Math.max(15, g)
        b = Math.max(25, b)
        break
      }

      case 'bright': {
        // Vibrant + glowing highlights + clarity
        r = clamp((r - 128) * 1.12 + 128 + 18)
        g = clamp((g - 128) * 1.12 + 128 + 18)
        b = clamp((b - 128) * 1.12 + 128 + 18)
        break
      }

      case 'film': {
        // Film 35mm tone: warm highlights, green-tinted deep shadows, subtle analog grain
        const grain = (Math.random() - 0.5) * 18
        r = clamp(r * 1.05 + 10 + grain)
        g = clamp(g * 1.02 + 8 + grain)
        b = clamp(b * 0.92 + 15 + grain)
        break
      }

      case 'cool': {
        // Cool modern tone: crisp contrast + blue bias
        r = clamp((r - 128) * 1.08 + 128 - 8)
        g = clamp((g - 128) * 1.08 + 128 + 2)
        b = clamp((b - 128) * 1.08 + 128 + 22)
        break
      }

      case 'normal':
      default:
        break
    }

    // ── C. Terapkan Brightness & Contrast ─────────────
    if (bOffset !== 0 || cFactor !== 1) {
      r = clamp((r - 128) * cFactor + 128 + bOffset)
      g = clamp((g - 128) * cFactor + 128 + bOffset)
      b = clamp((b - 128) * cFactor + 128 + bOffset)
    }

    // ── D. Terapkan Saturation ────────────────────────
    if (sFactor !== 1 && preset !== 'bw') {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      r = clamp(lum + (r - lum) * sFactor)
      g = clamp(lum + (g - lum) * sFactor)
      b = clamp(lum + (b - lum) * sFactor)
    }

    data[idx] = r
    data[idx + 1] = g
    data[idx + 2] = b
  }

  return imgData
}

/**
 * Menerapkan filter dan penyesuaian ke Canvas secara in-place atau mengembalikan canvas baru
 */
export function applyFiltersToCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: PhotoFilterOptions
): HTMLCanvasElement {
  // Jika normal dan tidak ada perubahan slider, langsung gunakan canvas asli
  if (
    options.preset === 'normal' &&
    options.brightness === 0 &&
    options.contrast === 0 &&
    options.saturation === 0 &&
    options.smoothSkin === 0
  ) {
    return sourceCanvas
  }

  const outCanvas = document.createElement('canvas')
  outCanvas.width = sourceCanvas.width
  outCanvas.height = sourceCanvas.height
  const ctx = outCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return sourceCanvas

  ctx.drawImage(sourceCanvas, 0, 0)
  const imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height)
  processImageDataWithFilters(imgData, options)
  ctx.putImageData(imgData, 0, 0)

  return outCanvas
}

/**
 * Membuat thumbnail kecil preview filter untuk bar preview
 */
export async function createFilterThumbnail(
  imgElement: HTMLImageElement,
  presetId: FilterPresetId,
  thumbSize = 90
): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = thumbSize
  canvas.height = thumbSize
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ''

  // Cover crop ke square
  const aspect = imgElement.width / imgElement.height
  let drawW = thumbSize
  let drawH = thumbSize
  let drawX = 0
  let drawY = 0

  if (aspect > 1) {
    drawH = thumbSize
    drawW = thumbSize * aspect
    drawX = -(drawW - thumbSize) / 2
  } else {
    drawW = thumbSize
    drawH = thumbSize / aspect
    drawY = -(drawH - thumbSize) / 2
  }

  ctx.drawImage(imgElement, drawX, drawY, drawW, drawH)

  const imgData = ctx.getImageData(0, 0, thumbSize, thumbSize)
  processImageDataWithFilters(imgData, {
    preset: presetId,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    smoothSkin: 0,
  })
  ctx.putImageData(imgData, 0, 0)

  return canvas.toDataURL('image/jpeg', 0.85)
}
