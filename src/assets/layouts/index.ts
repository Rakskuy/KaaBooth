/**
 * assets/layouts/index.ts
 * Konfigurasi layout photobooth berbasis persentase dimensi kanvas.
 * Mendukung Strip Vertikal 3 Foto, Strip Vertikal 4 Foto, Grid 2x2, dan Single Foto.
 */

export interface PhotoSlot {
  /** Posisi X dalam persen (0 - 100) dari lebar kanvas */
  x: number
  /** Posisi Y dalam persen (0 - 100) dari tinggi kanvas */
  y: number
  /** Lebar slot dalam persen (0 - 100) dari lebar kanvas */
  width: number
  /** Tinggi slot dalam persen (0 - 100) dari tinggi kanvas */
  height: number
  /** Radius lengkungan sudut slot foto (px pada skala kanvas) */
  borderRadius?: number
}

export interface TextSlot {
  x: number
  y: number
  width: number
  height: number
  align: 'center' | 'left' | 'right'
}

export interface LogoSlot {
  x: number
  y: number
  width: number
  height: number
  align: 'center' | 'left' | 'right'
}

export interface LayoutConfig {
  id: string
  name: string
  description: string
  /** Dimensi output pixel resolusi tinggi */
  canvasWidth: number
  canvasHeight: number
  /** Rasio aspek untuk UI preview ratio (misal '1/3', '3/4', '1/1') */
  aspectRatioLabel: string
  /** Jumlah foto yang ideal untuk layout ini */
  photoCount: number
  /** Daftar slot foto */
  slots: PhotoSlot[]
  /** Slot penempatan teks judul & tanggal */
  textSlot: TextSlot
  /** Slot penempatan logo opsional */
  logoSlot?: LogoSlot
}

export const PHOTO_LAYOUTS: LayoutConfig[] = [
  {
    id: 'vertical-4',
    name: 'Strip Vertikal 4 Foto',
    description: 'Format strip photobooth klasik memanjang dengan 4 pose',
    canvasWidth: 1200,
    canvasHeight: 3600,
    aspectRatioLabel: '1:3',
    photoCount: 4,
    slots: [
      { x: 7, y: 3.5, width: 86, height: 20.5, borderRadius: 20 },
      { x: 7, y: 25.5, width: 86, height: 20.5, borderRadius: 20 },
      { x: 7, y: 47.5, width: 86, height: 20.5, borderRadius: 20 },
      { x: 7, y: 69.5, width: 86, height: 20.5, borderRadius: 20 },
    ],
    textSlot: {
      x: 7,
      y: 91.5,
      width: 86,
      height: 4.5,
      align: 'center',
    },
    logoSlot: {
      x: 35,
      y: 96.5,
      width: 30,
      height: 2.5,
      align: 'center',
    },
  },
  {
    id: 'vertical-3',
    name: 'Strip Vertikal 3 Foto',
    description: 'Strip photobooth proporsional dengan 3 pose ekspresif',
    canvasWidth: 1200,
    canvasHeight: 2800,
    aspectRatioLabel: '1:2.33',
    photoCount: 3,
    slots: [
      { x: 7, y: 4.5, width: 86, height: 26.5, borderRadius: 20 },
      { x: 7, y: 33, width: 86, height: 26.5, borderRadius: 20 },
      { x: 7, y: 61.5, width: 86, height: 26.5, borderRadius: 20 },
    ],
    textSlot: {
      x: 7,
      y: 89.5,
      width: 86,
      height: 5.5,
      align: 'center',
    },
    logoSlot: {
      x: 35,
      y: 95.5,
      width: 30,
      height: 3.2,
      align: 'center',
    },
  },
  {
    id: 'grid-2x2',
    name: 'Grid 2x2 Persegi',
    description: 'Tata letak 4 foto estetik ala Instagram Post',
    canvasWidth: 1800,
    canvasHeight: 1900,
    aspectRatioLabel: '1:1.05',
    photoCount: 4,
    slots: [
      { x: 5, y: 4.5, width: 43.5, height: 40, borderRadius: 20 },
      { x: 51.5, y: 4.5, width: 43.5, height: 40, borderRadius: 20 },
      { x: 5, y: 47, width: 43.5, height: 40, borderRadius: 20 },
      { x: 51.5, y: 47, width: 43.5, height: 40, borderRadius: 20 },
    ],
    textSlot: {
      x: 6,
      y: 88.5,
      width: 88,
      height: 6.5,
      align: 'center',
    },
    logoSlot: {
      x: 40,
      y: 95.2,
      width: 20,
      height: 3.5,
      align: 'center',
    },
  },
  {
    id: 'single',
    name: 'Satu Foto Besar',
    description: 'Potret tunggal berbingkai elegan untuk hasil foto terbaik',
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatioLabel: '3:4',
    photoCount: 1,
    slots: [
      { x: 7, y: 5.5, width: 86, height: 78, borderRadius: 24 },
    ],
    textSlot: {
      x: 7,
      y: 85.5,
      width: 86,
      height: 8,
      align: 'center',
    },
    logoSlot: {
      x: 35,
      y: 94.5,
      width: 30,
      height: 4,
      align: 'center',
    },
  },
]

export function getLayoutById(id: string): LayoutConfig {
  return PHOTO_LAYOUTS.find((l) => l.id === id) || PHOTO_LAYOUTS[0]
}
