/**
 * components/OfflineBanner.tsx
 * Indikator status jaringan (Online/Offline) dan auto-reconnect notice.
 */

import { useState, useEffect } from 'react'
import { useI18n } from '../lib/i18n'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [showRestored, setShowRestored] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      const timer = setTimeout(() => setShowRestored(false), 3000)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 text-center py-2 px-4 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
        !isOnline
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-600 text-white animate-in fade-in duration-200'
      }`}
    >
      <span>{!isOnline ? '⚠️' : '✅'}</span>
      <span>{!isOnline ? t('status_offline') : t('status_reconnected')}</span>
    </div>
  )
}
