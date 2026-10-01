/**
 * lib/supabase.ts
 * Integrasi Supabase Client, Auth Admin, Query Event CRUD, Galeri Event, dan Mode Kiosk (Tahap 7).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface EventConfig {
  frameId?: string
  backgroundColor?: string
  customFrameUrl?: string | null
  logoUrl?: string | null
  title?: string
  fontFamily?: string
  textColor?: string
  allowedLayouts?: string[]
  defaultPhotoCount?: 1 | 3 | 4
  defaultCountdown?: 3 | 5 | 10
  showDate?: boolean
  showWatermark?: boolean
  watermarkText?: string | null
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  frameId: 'clean',
  backgroundColor: '#121218',
  customFrameUrl: null,
  logoUrl: null,
  title: 'KaBooth Moments',
  fontFamily: 'Outfit',
  textColor: '#ffffff',
  allowedLayouts: ['single', 'vertical-3', 'vertical-4', 'grid-2x2'],
  defaultPhotoCount: 4,
  defaultCountdown: 3,
  showDate: true,
  showWatermark: false,
  watermarkText: 'KaBooth',
}

export interface PhotoboothEvent {
  id: string
  slug: string
  nama: string
  tanggal: string
  is_active: boolean
  pin_kiosk: string
  kode_akses?: string | null
  konfigurasi_frame: EventConfig
  retensi_hari: number
  dibuat_pada: string
  photo_count?: number
}

export interface PhotoboothPhoto {
  id: string
  event_id: string | null
  storage_path: string
  jenis: 'foto' | 'gif'
  file_size_bytes: number
  dibuat_pada: string
  event?: PhotoboothEvent | null
}

export interface UploadPhotoResult {
  photoId: string
  storagePath: string
  publicUrl: string
  shareUrl: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Cek apakah Supabase telah dikonfigurasi dengan URL & Anon Key yang valid
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id')
  )
}

/**
 * Instance Supabase Client
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024 // 8 MB

/**
 * Mendapatkan Public URL dari Storage Path
 */
export function getPublicStorageUrl(storagePath: string): string {
  if (!supabase || !storagePath) return ''
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath)
  return data.publicUrl
}

// ── PHOTOBOOTH PUBLIC ACTIONS ────────────────────────────

export async function uploadPhotoboothPhoto(
  blob: Blob,
  eventId: string | null = null,
  jenis: 'foto' | 'gif' = 'foto'
): Promise<UploadPhotoResult> {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error(
      'Supabase belum dikonfigurasi. Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.'
    )
  }

  // 1. Validasi Ukuran File (Maks 8 MB)
  if (blob.size > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(1)
    throw new Error(`Ukuran file (${sizeMb} MB) melebihi batas maksimal 8 MB.`)
  }

  // 2. Validasi Tipe File
  const validTypes = ['image/png', 'image/jpeg', 'image/gif']
  if (!validTypes.includes(blob.type)) {
    throw new Error(`Tipe file (${blob.type}) tidak didukung.`)
  }

  const extension = jenis === 'gif' ? 'gif' : blob.type === 'image/png' ? 'png' : 'jpg'
  const photoUuid = crypto.randomUUID()
  const storagePath = eventId
    ? `events/${eventId}/${photoUuid}.${extension}`
    : `public/${photoUuid}.${extension}`

  // 3. Upload File ke Storage Bucket 'photos' dengan Auto-Retry (hingga 3 kali)
  let uploadError: any = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { error } = await supabase.storage
      .from('photos')
      .upload(storagePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (!error) {
      uploadError = null
      break
    }

    uploadError = error
    if (attempt < 3) {
      // Jeda 1 detik sebelum coba lagi
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError)
    throw new Error(`Gagal mengunggah file ke cloud setelah 3 percobaan: ${uploadError.message}`)
  }

  // 4. Simpan Metadata ke Tabel 'photos'
  const { data: insertedData, error: dbError } = await supabase
    .from('photos')
    .insert([
      {
        id: photoUuid,
        event_id: eventId || null,
        storage_path: storagePath,
        jenis,
        file_size_bytes: blob.size,
      },
    ])
    .select('id')
    .single()

  if (dbError || !insertedData) {
    console.error('Supabase DB insert error:', dbError)
    await supabase.storage.from('photos').remove([storagePath]).catch(() => null)
    throw new Error(`Gagal menyimpan catatan foto: ${dbError?.message || 'Database error'}`)
  }

  const publicUrl = getPublicStorageUrl(storagePath)
  const shareUrl = `${window.location.origin}/p/${photoUuid}`

  return {
    photoId: photoUuid,
    storagePath,
    publicUrl,
    shareUrl,
  }
}

export async function getPhotoById(photoId: string): Promise<PhotoboothPhoto | null> {
  if (!supabase || !isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from('photos')
    .select(
      `
      id,
      event_id,
      storage_path,
      jenis,
      file_size_bytes,
      dibuat_pada,
      event:events (
        id,
        slug,
        nama,
        tanggal,
        is_active,
        pin_kiosk,
        konfigurasi_frame,
        retensi_hari,
        dibuat_pada
      )
    `
    )
    .eq('id', photoId)
    .single()

  if (error || !data) {
    console.warn(`Foto dengan id ${photoId} tidak ditemukan:`, error)
    return null
  }

  return data as unknown as PhotoboothPhoto
}

export async function getEventBySlug(slug: string): Promise<PhotoboothEvent | null> {
  if (!supabase || !isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.warn(`Event dengan slug '${slug}' tidak ditemukan:`, error)
    return null
  }

  return data as PhotoboothEvent
}
