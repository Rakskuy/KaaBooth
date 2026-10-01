/**
 * lib/i18n.ts
 * Semua teks UI tersimpan di sini.
 * Untuk menambah bahasa baru: tambah key di Translations dan isi tiap string.
 */

import { useState, useEffect } from 'react'

export type Locale = 'id' | 'en'

export interface Translations {
  // ── Landing ─────────────────────────────────────────
  landing_title: string
  landing_subtitle: string
  landing_cta: string
  landing_privacy: string

  // ── Navigasi ─────────────────────────────────────────
  nav_back: string

  // ── Kamera ───────────────────────────────────────────
  camera_loading: string
  camera_switch: string
  camera_ratio_34: string
  camera_ratio_43: string
  camera_ratio_11: string

  // ── Error ────────────────────────────────────────────
  error_denied_title: string
  error_denied_desc: string
  error_denied_chrome: string
  error_denied_safari: string
  error_nocamera_title: string
  error_nocamera_desc: string
  error_unsupported_title: string
  error_unsupported_desc: string
  error_retry: string

  // ── In-app browser ───────────────────────────────────
  inapp_title: string
  inapp_desc: string
  inapp_open_chrome: string
  inapp_open_safari: string

  // ── Session Settings ─────────────────────────────────
  session_title: string
  session_photo_count: string
  session_photo_unit: string // "foto" / "photo"
  session_countdown_timer: string
  session_aspect: string
  session_sound: string
  session_sound_on: string
  session_sound_off: string
  session_start_btn: string

  // ── Session Active ───────────────────────────────────
  session_photo_of: string
  session_cancel: string
  session_photo_saved: string

  // ── Review ───────────────────────────────────────────
  review_title: string
  review_retake_one: string
  review_retake_all: string
  review_upload: string
  review_proceed: string

  // ── Tahap 3 & 4: Editor & Komposisi ──────────────────
  editor_title: string
  editor_tab_layout: string
  editor_tab_frame: string
  editor_tab_filter: string
  editor_tab_stickers: string
  editor_tab_bg: string
  editor_tab_text: string
  editor_tab_logo: string
  editor_tab_gif: string
  editor_tab_options: string

  editor_layout_select: string
  editor_frame_select: string
  editor_bg_color: string
  editor_bg_presets: string
  editor_custom_color: string

  editor_text_title: string
  editor_text_placeholder: string
  editor_text_font: string
  editor_text_color: string
  editor_text_date_toggle: string
  editor_text_date_custom: string

  editor_logo_upload: string
  editor_logo_change: string
  editor_logo_remove: string
  editor_logo_hint: string

  editor_mirror_toggle: string
  editor_mirror_desc: string

  // Tahap 4 translations
  editor_filter_title: string
  editor_filter_adjust_title: string
  editor_brightness: string
  editor_contrast: string
  editor_saturation: string
  editor_smooth_skin: string
  editor_smooth_skin_hint: string
  editor_reset_effects: string
  editor_reset_effects_confirm: string

  editor_stickers_title: string
  editor_stickers_hint: string
  editor_stickers_tab_emoji: string
  editor_stickers_tab_svg: string
  editor_stickers_clear_all: string
  editor_stickers_selected: string

  editor_gif_title: string
  editor_gif_desc: string
  editor_gif_mode_sequence: string
  editor_gif_mode_boomerang: string
  editor_gif_speed_slow: string
  editor_gif_speed_normal: string
  editor_gif_speed_fast: string
  editor_gif_download_btn: string
  editor_gif_generating: string

  editor_btn_download_png: string
  editor_btn_download_jpg: string
  editor_btn_downloading: string
  editor_download_success: string
  editor_retake_session: string
  editor_proceed_to_result: string

  // ── Tahap 5: Result & Share ──────────────────────────
  result_title: string
  result_subtitle: string
  result_share_btn: string
  result_save_gallery: string
  result_save_ios_guide_title: string
  result_save_ios_guide_desc: string
  result_share_wa: string
  result_copy_image: string
  result_copied: string
  result_btn_retake_session: string
  result_btn_new_session: string
  result_btn_edit_again: string
  result_confirm_retake_title: string
  result_confirm_retake_desc: string
  result_confirm_yes: string
  result_confirm_cancel: string

  // ── Tahap 8: Release & Polish ────────────────────────
  theme_pixel: string
  theme_dark: string
  theme_light: string
  lang_label: string

  legal_privacy: string
  legal_terms: string
  legal_privacy_title: string
  legal_terms_title: string
  legal_close: string
  watermark_title: string
  watermark_enable: string
  watermark_placeholder: string
  status_offline: string
  status_retrying: string
  status_reconnected: string
  pwa_install_prompt: string
  pwa_install_btn: string
}

// ────────────────────────────────────────────────────────
// Bahasa Indonesia (default)
// ────────────────────────────────────────────────────────
const id: Translations = {
  landing_title: 'KaBooth',
  landing_subtitle:
    'Buat kenangan indah langsung dari browser-mu. Tanpa install aplikasi.',
  landing_cta: 'Mulai Foto 📸',
  landing_privacy:
    'Foto kamu diproses langsung di perangkatmu dan tidak dikirim ke server mana pun.',

  nav_back: 'Kembali',

  camera_loading: 'Mengaktifkan kamera…',
  camera_switch: 'Ganti Kamera',
  camera_ratio_34: '3:4',
  camera_ratio_43: '4:3',
  camera_ratio_11: '1:1',

  error_denied_title: 'Akses Kamera Ditolak',
  error_denied_desc:
    'Browser memerlukan izin kamera untuk melanjutkan. Ikuti langkah berikut:',
  error_denied_chrome:
    'Chrome: Ketuk ikon kunci/info (🔒) di address bar → Izin situs → Kamera → Izinkan, lalu muat ulang.',
  error_denied_safari:
    'Safari: Buka Pengaturan iPhone → Safari → Kamera → Izinkan, lalu kembali ke halaman ini.',
  error_nocamera_title: 'Kamera Tidak Ditemukan',
  error_nocamera_desc:
    'Perangkatmu tidak memiliki kamera yang dapat diakses. Pastikan tidak ada aplikasi lain yang sedang menggunakan kamera.',
  error_unsupported_title: 'Browser Tidak Didukung',
  error_unsupported_desc:
    'Browser ini tidak mendukung akses kamera. Gunakan Chrome terbaru atau Safari 14+ untuk pengalaman terbaik.',
  error_retry: 'Coba Lagi',

  inapp_title: 'Buka di Browser Utama',
  inapp_desc:
    'Kamu sedang membuka halaman ini dari browser in-app (Instagram, TikTok, WhatsApp, dsb.) yang tidak mendukung akses kamera sepenuhnya.',
  inapp_open_chrome: 'Buka di Chrome',
  inapp_open_safari: 'Buka di Safari',

  session_title: 'Pengaturan Sesi',
  session_photo_count: 'Jumlah Foto',
  session_photo_unit: 'foto',
  session_countdown_timer: 'Timer Countdown',
  session_aspect: 'Rasio Foto',
  session_sound: 'Suara Shutter',
  session_sound_on: 'Suara aktif',
  session_sound_off: 'Suara mati',
  session_start_btn: 'Mulai Sesi 🎬',

  session_photo_of: 'Foto {n} dari {total}',
  session_cancel: 'Batalkan',
  session_photo_saved: 'Tersimpan!',

  review_title: 'Review Foto',
  review_retake_one: 'Ulang Foto',
  review_retake_all: 'Ulang Semua',
  review_upload: 'Unggah',
  review_proceed: 'Lanjut ke Editor 🎨',

  // ── Tahap 3 & 4: Editor ───────────────────────────────
  editor_title: 'Desain Photobooth',
  editor_tab_layout: 'Layout',
  editor_tab_frame: 'Frame',
  editor_tab_filter: 'Filter & Penyesuaian',
  editor_tab_stickers: 'Stiker',
  editor_tab_bg: 'Warna',
  editor_tab_text: 'Teks',
  editor_tab_logo: 'Logo',
  editor_tab_gif: 'GIF / Boomerang',
  editor_tab_options: 'Opsi',

  editor_layout_select: 'Pilih Format Layout',
  editor_frame_select: 'Pilih Desain Frame',
  editor_bg_color: 'Warna Latar Frame',
  editor_bg_presets: 'Pilihan Palet Warna',
  editor_custom_color: 'Pilih Warna Kustom',

  editor_text_title: 'Teks / Judul Acara',
  editor_text_placeholder: 'Tulis nama acara atau pesan...',
  editor_text_font: 'Pilihan Font',
  editor_text_color: 'Warna Teks',
  editor_text_date_toggle: 'Tampilkan Tanggal Otomatis',
  editor_text_date_custom: 'Ubah Tanggal (opsional)',

  editor_logo_upload: 'Unggah Logo Acara / Komunitas',
  editor_logo_change: 'Ganti Logo',
  editor_logo_remove: 'Hapus Logo',
  editor_logo_hint: 'Format PNG transparan atau JPEG (posisi di bagian bawah strip)',

  editor_mirror_toggle: 'Mirror Foto Horizontal',
  editor_mirror_desc: 'Balik foto seperti saat bercermin (default: mati)',

  // Tahap 4
  editor_filter_title: 'Filter Siap Pakai',
  editor_filter_adjust_title: 'Penyesuaian Visual',
  editor_brightness: 'Kecerahan',
  editor_contrast: 'Kontras',
  editor_saturation: 'Saturasi',
  editor_smooth_skin: 'Haluskan Kulit Alami',
  editor_smooth_skin_hint: 'Blur lembut dengan proteksi detail mata & bibir',
  editor_reset_effects: 'Reset Semua Efek',
  editor_reset_effects_confirm: 'Yakin ingin mereset filter dan penyesuaian?',

  editor_stickers_title: 'Stiker & Emoji',
  editor_stickers_hint: 'Sentuh/klik stiker untuk memilih. Geser, cubit/putar untuk mengatur posisi.',
  editor_stickers_tab_emoji: 'Emoji Populer',
  editor_stickers_tab_svg: 'Desain Grafis SVG',
  editor_stickers_clear_all: 'Hapus Semua Stiker',
  editor_stickers_selected: 'Stiker Aktif',

  editor_gif_title: 'Animasi GIF & Boomerang',
  editor_gif_desc: 'Gabungkan seluruh pose fotomu menjadi animasi berulang (GIF) siap share!',
  editor_gif_mode_sequence: 'Mode Berurutan (1-2-3-4)',
  editor_gif_mode_boomerang: 'Mode Boomerang (Maju-Mundur)',
  editor_gif_speed_slow: 'Santai (500ms)',
  editor_gif_speed_normal: 'Standar (350ms)',
  editor_gif_speed_fast: 'Cepat (200ms)',
  editor_gif_download_btn: 'Unduh GIF Animasi 🎬',
  editor_gif_generating: 'Memproses GIF HD ({progress}%)…',

  editor_btn_download_png: 'Unduh PNG (Kualitas Tinggi)',
  editor_btn_download_jpg: 'Unduh JPEG',
  editor_btn_downloading: 'Menyusun Canvas HD...',
  editor_download_success: 'Berhasil diunduh!',
  editor_retake_session: 'Sesi Foto Baru',
  editor_proceed_to_result: 'Lihat Hasil & Bagikan 🚀',

  // ── Tahap 5: Result & Share ──────────────────────────
  result_title: 'Hasil Photobooth Kamu ✨',
  result_subtitle: 'Foto kenanganmu sudah siap diunduh & dibagikan ke teman-teman!',
  result_share_btn: 'Bagikan Foto 🚀',
  result_save_gallery: 'Simpan ke Galeri 📸',
  result_save_ios_guide_title: 'Cara Simpan ke Foto iPhone/iPad',
  result_save_ios_guide_desc: 'Tekan dan tahan gambar di bawah ini selama 1-2 detik, lalu pilih menu "Simpan ke Foto" (Save to Photos).',
  result_share_wa: 'Kirim ke WhatsApp 💬',
  result_copy_image: 'Salin Gambar 📋',
  result_copied: 'Gambar berhasil disalin ke clipboard!',
  result_btn_retake_session: 'Foto Lagi 🔄',
  result_btn_new_session: 'Mulai Baru 🏠',
  result_btn_edit_again: 'Ubah Desain 🎨',
  result_confirm_retake_title: 'Mulai Sesi Foto Baru?',
  result_confirm_retake_desc: 'Foto saat ini akan dikosongkan untuk mengambil pose baru. Pastikan kamu sudah menyimpan hasil foto kamu!',
  result_confirm_yes: 'Ya, Foto Lagi 📸',
  result_confirm_cancel: 'Batal',

  // Tahap 8
  theme_pixel: 'Game Pixel 👾',
  theme_dark: 'Mode Gelap 🌙',
  theme_light: 'Mode Terang ☀️',
  lang_label: 'Bahasa',
  legal_privacy: 'Kebijakan Privasi',
  legal_terms: 'Syarat Penggunaan',
  legal_privacy_title: 'Kebijakan Privasi KaBooth',
  legal_terms_title: 'Syarat & Ketentuan Penggunaan',
  legal_close: 'Tutup',
  watermark_title: 'Watermark Acara',
  watermark_enable: 'Aktifkan Watermark',
  watermark_placeholder: 'Teks watermark (contoh: KaBooth © 2026)',
  status_offline: 'Koneksi internet terputus. Photobooth tetap berfungsi secara lokal.',
  status_retrying: 'Mencoba mengunggah ulang foto…',
  status_reconnected: 'Koneksi internet pulih kembali!',
  pwa_install_prompt: 'Pasang KaBooth di layar utama untuk akses instan tanpa browser!',
  pwa_install_btn: 'Pasang Aplikasi 📲',
}

// ────────────────────────────────────────────────────────
// English
// ────────────────────────────────────────────────────────
const en: Translations = {
  landing_title: 'KaBooth',
  landing_subtitle:
    'Create beautiful memories right from your browser. No app install needed.',
  landing_cta: 'Start Photo 📸',
  landing_privacy:
    'Your photos are processed entirely on your device and are never uploaded to any server.',

  nav_back: 'Back',

  camera_loading: 'Starting camera…',
  camera_switch: 'Switch Camera',
  camera_ratio_34: '3:4',
  camera_ratio_43: '4:3',
  camera_ratio_11: '1:1',

  error_denied_title: 'Camera Access Denied',
  error_denied_desc:
    'The browser needs camera permission to continue. Follow these steps:',
  error_denied_chrome:
    'Chrome: Tap the lock/info icon (🔒) in the address bar → Site permissions → Camera → Allow, then reload.',
  error_denied_safari:
    'Safari: Open iPhone Settings → Safari → Camera → Allow, then return to this page.',
  error_nocamera_title: 'Camera Not Found',
  error_nocamera_desc:
    'No accessible camera was found on your device. Ensure no other apps are using the camera.',
  error_unsupported_title: 'Browser Not Supported',
  error_unsupported_desc:
    'This browser does not support camera access. Use the latest Chrome or Safari 14+ for the best experience.',
  error_retry: 'Try Again',

  inapp_title: 'Open in Main Browser',
  inapp_desc:
    'You are viewing this from an in-app browser (Instagram, TikTok, WhatsApp, etc.) which does not fully support camera access.',
  inapp_open_chrome: 'Open in Chrome',
  inapp_open_safari: 'Open in Safari',

  session_title: 'Session Settings',
  session_photo_count: 'Photo Count',
  session_photo_unit: 'photos',
  session_countdown_timer: 'Countdown Timer',
  session_aspect: 'Photo Ratio',
  session_sound: 'Shutter Sound',
  session_sound_on: 'Sound on',
  session_sound_off: 'Sound off',
  session_start_btn: 'Start Session 🎬',

  session_photo_of: 'Photo {n} of {total}',
  session_cancel: 'Cancel',
  session_photo_saved: 'Saved!',

  review_title: 'Review Photos',
  review_retake_one: 'Retake',
  review_retake_all: 'Retake All',
  review_upload: 'Upload',
  review_proceed: 'Go to Editor 🎨',

  // ── Stage 3 & 4: Editor ───────────────────────────────
  editor_title: 'Photobooth Studio',
  editor_tab_layout: 'Layout',
  editor_tab_frame: 'Frame',
  editor_tab_filter: 'Filters & Adjustments',
  editor_tab_stickers: 'Stickers',
  editor_tab_bg: 'Color',
  editor_tab_text: 'Text',
  editor_tab_logo: 'Logo',
  editor_tab_gif: 'GIF / Boomerang',
  editor_tab_options: 'Options',

  editor_layout_select: 'Select Layout Format',
  editor_frame_select: 'Select Frame Design',
  editor_bg_color: 'Frame Background Color',
  editor_bg_presets: 'Color Palette Presets',
  editor_custom_color: 'Custom Color',

  editor_text_title: 'Event Title / Caption',
  editor_text_placeholder: 'Enter event name or message...',
  editor_text_font: 'Font Style',
  editor_text_color: 'Text Color',
  editor_text_date_toggle: 'Show Date Automatically',
  editor_text_date_custom: 'Change Date (optional)',

  editor_logo_upload: 'Upload Event / Brand Logo',
  editor_logo_change: 'Change Logo',
  editor_logo_remove: 'Remove Logo',
  editor_logo_hint: 'Transparent PNG or JPEG (placed at the bottom strip)',

  editor_mirror_toggle: 'Mirror Photos Horizontally',
  editor_mirror_desc: 'Flip photos like looking in a mirror (default: off)',

  // Stage 4
  editor_filter_title: 'Ready-to-use Filters',
  editor_filter_adjust_title: 'Visual Adjustments',
  editor_brightness: 'Brightness',
  editor_contrast: 'Contrast',
  editor_saturation: 'Saturation',
  editor_smooth_skin: 'Smooth Skin',
  editor_smooth_skin_hint: 'Natural soft blur protecting eyes & lip details',
  editor_reset_effects: 'Reset All Effects',
  editor_reset_effects_confirm: 'Reset all filters and adjustments?',

  editor_stickers_title: 'Stickers & Emojis',
  editor_stickers_hint: 'Tap sticker to select. Drag, pinch or rotate to arrange.',
  editor_stickers_tab_emoji: 'Popular Emojis',
  editor_stickers_tab_svg: 'SVG Graphic Stamps',
  editor_stickers_clear_all: 'Clear All Stickers',
  editor_stickers_selected: 'Active Sticker',

  editor_gif_title: 'Animated GIF & Boomerang',
  editor_gif_desc: 'Combine all your poses into a looping animation ready to share!',
  editor_gif_mode_sequence: 'Sequential (1-2-3-4)',
  editor_gif_mode_boomerang: 'Boomerang (Forward-Back)',
  editor_gif_speed_slow: 'Slow (500ms)',
  editor_gif_speed_normal: 'Standard (350ms)',
  editor_gif_speed_fast: 'Fast (200ms)',
  editor_gif_download_btn: 'Download Animated GIF 🎬',
  editor_gif_generating: 'Rendering HD GIF ({progress}%)…',

  editor_btn_download_png: 'Download PNG (High Quality)',
  editor_btn_download_jpg: 'Download JPEG',
  editor_btn_downloading: 'Rendering HD Canvas...',
  editor_download_success: 'Downloaded successfully!',
  editor_retake_session: 'New Photo Session',
  editor_proceed_to_result: 'View Result & Share 🚀',

  // ── Stage 5: Result & Share ──────────────────────────
  result_title: 'Your Photobooth Result ✨',
  result_subtitle: 'Your photo moments are ready to download & share with friends!',
  result_share_btn: 'Share Photo 🚀',
  result_save_gallery: 'Save to Gallery 📸',
  result_save_ios_guide_title: 'How to Save on iPhone/iPad',
  result_save_ios_guide_desc: 'Tap and hold the image below for 1-2 seconds, then tap "Save to Photos".',
  result_share_wa: 'Share to WhatsApp 💬',
  result_copy_image: 'Copy Image 📋',
  result_copied: 'Image copied to clipboard!',
  result_btn_retake_session: 'Retake Photos 🔄',
  result_btn_new_session: 'Start Over 🏠',
  result_btn_edit_again: 'Edit Design 🎨',
  result_confirm_retake_title: 'Start a New Photo Session?',
  result_confirm_retake_desc: 'Current photos will be cleared for a new session. Make sure you have saved your photo!',
  result_confirm_yes: 'Yes, Retake 📸',
  result_confirm_cancel: 'Cancel',

  // Stage 8
  theme_pixel: 'Pixel Game 👾',
  theme_dark: 'Dark Mode 🌙',
  theme_light: 'Light Mode ☀️',
  lang_label: 'Language',
  legal_privacy: 'Privacy Policy',
  legal_terms: 'Terms of Use',
  legal_privacy_title: 'KaBooth Privacy Policy',
  legal_terms_title: 'Terms and Conditions',
  legal_close: 'Close',
  watermark_title: 'Event Watermark',
  watermark_enable: 'Enable Watermark',
  watermark_placeholder: 'Watermark text (e.g. KaBooth © 2026)',
  status_offline: 'Internet connection lost. Photobooth remains functional offline.',
  status_retrying: 'Retrying photo upload…',
  status_reconnected: 'Internet connection restored!',
  pwa_install_prompt: 'Install KaBooth on your home screen for instant full-screen photobooth access!',
  pwa_install_btn: 'Install App 📲',
}

const translations: Record<Locale, Translations> = { id, en }

const LOCALE_STORAGE_KEY = 'snapbooth_locale'

export function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'id' || saved === 'en') return saved
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en'
    }
  } catch {}
  return 'id'
}

let currentLocale: Locale = getInitialLocale()
const listeners = new Set<(locale: Locale) => void>()

export function setLocale(locale: Locale) {
  currentLocale = locale
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  } catch {}
  listeners.forEach((fn) => fn(locale))
}

export function getLocale(): Locale {
  return currentLocale
}

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale())

  useEffect(() => {
    const listener = (newLocale: Locale) => setLocaleState(newLocale)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    locale,
    setLocale,
    t: (key: keyof Translations, params?: Record<string, string | number>) =>
      t(key, params),
  }
}

export function t(
  key: keyof Translations,
  params?: Record<string, string | number>
): string {
  let str = translations[currentLocale]?.[key] ?? translations.id[key] ?? key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    })
  }
  return str
}

