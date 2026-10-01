/**
 * lib/shareHelper.ts
 * Helper untuk fitur Web Share API, Fallback WhatsApp, dan Salin ke Clipboard.
 */

import { isIOS } from './browserDetect'

export interface ShareOptions {
  blob: Blob
  filename: string
  title?: string
  text?: string
}

/**
 * Cek apakah browser mendukung Web Share API dengan file attachment
 */
export function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined') return false
  if (typeof navigator.share !== 'function') return false

  if (typeof navigator.canShare === 'function') {
    try {
      return navigator.canShare({ files: [file] })
    } catch {
      return false
    }
  }

  // Fallback: jika navigator.share ada tetapi canShare tidak ada
  return Boolean(navigator.share)
}

/**
 * Membagikan file photobooth menggunakan Web Share API
 */
export async function sharePhotoboothFile(options: ShareOptions): Promise<boolean> {
  const { blob, filename, title = 'KaBooth Photobooth', text = 'Lihat hasil fotoku dari KaBooth! 📸✨' } = options

  const file = new File([blob], filename, { type: blob.type })

  if (canShareFile(file)) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      })
      return true
    } catch (err) {
      // Jika user membatalkan (AbortError), jangan anggap error sistem
      if ((err as Error).name === 'AbortError') {
        return false
      }
      console.warn('Gagal share via Web Share API:', err)
      throw err
    }
  } else if (typeof navigator.share === 'function') {
    // Fallback share teks/link jika file tidak didukung
    try {
      await navigator.share({
        title,
        text: `${text}\n${window.location.href}`,
      })
      return true
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false
      throw err
    }
  }

  return false
}

/**
 * Fallback: Buka WhatsApp Web / App dengan pesan default
 */
export function shareToWhatsApp(customMessage?: string): void {
  const message =
    customMessage ||
    `Hai! Cek foto kenangan photobooth kita di KaBooth: ${window.location.href} 📸✨`

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Salin gambar ke clipboard jika didukung (Chrome / Safari Modern)
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false
  }

  try {
    // Clipboard API memerlukan image/png
    let pngBlob = blob
    if (blob.type !== 'image/png') {
      pngBlob = new Blob([blob], { type: 'image/png' })
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        [pngBlob.type]: pngBlob,
      }),
    ])
    return true
  } catch (err) {
    console.warn('Gagal menyalin gambar ke clipboard:', err)
    return false
  }
}

/**
 * Cek apakah perangkat adalah iPhone/iPad untuk menampilkan panduan simpan foto
 */
export function isIPhoneOrIPad(): boolean {
  return isIOS()
}
