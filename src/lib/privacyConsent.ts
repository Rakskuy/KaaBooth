/**
 * lib/privacyConsent.ts
 * Helper penyimpanan status persetujuan privasi di localStorage.
 */

export const PRIVACY_CONSENT_KEY = 'snapbooth_privacy_consent_accepted'

export function hasAcceptedPrivacyConsent(): boolean {
  try {
    return localStorage.getItem(PRIVACY_CONSENT_KEY) === 'true'
  } catch {
    return false
  }
}

export function savePrivacyConsent(): void {
  try {
    localStorage.setItem(PRIVACY_CONSENT_KEY, 'true')
  } catch (err) {
    console.warn('Gagal menyimpan consent ke localStorage:', err)
  }
}
