/**
 * lib/browserDetect.ts
 * Deteksi in-app browser dan platform.
 */

/** Daftar user-agent pattern in-app browser yang membatasi akses kamera */
const IN_APP_PATTERNS = [
  /Instagram/i,
  /FBAN|FBAV|FB_IAB|FB4A|FBIOS/i, // Facebook & Facebook Lite
  /musical_ly|TikTok/i,
  /WhatsApp/i,
  /Snapchat/i,
  /Twitter/i,
  /Line\//i,
  /Telegram/i,
  /Pinterest/i,
]

export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent
  return IN_APP_PATTERNS.some((pattern) => pattern.test(ua))
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

export function isMobile(): boolean {
  return isIOS() || isAndroid()
}

/**
 * Apakah perangkat mendukung enumeration kamera (hasMultipleCameras)?
 * Hanya bisa dicek setelah izin diberikan.
 */
export async function hasMultipleCameras(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter((d) => d.kind === 'videoinput')
    return cameras.length > 1
  } catch {
    return false
  }
}
