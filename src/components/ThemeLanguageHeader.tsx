/**
 * components/ThemeLanguageHeader.tsx
 * Bar Kontrol Aksesibilitas: Pengalih Tema (Dark/Light), Bahasa (ID/EN), PWA Install, dan Info Legal.
 */

import { useState, useEffect } from 'react'
import { useTheme } from '../lib/theme'
import { useI18n } from '../lib/i18n'

interface ThemeLanguageHeaderProps {
  onOpenPrivacy?: () => void
  onOpenTerms?: () => void
}

export function ThemeLanguageHeader({
  onOpenPrivacy,
  onOpenTerms,
}: ThemeLanguageHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-3 z-30 select-none">
      {/* Left: Branding / Home */}
      <div className="flex items-center gap-2">
        <span className="text-xl animate-pulse">
          {theme === 'pixel' ? '👾' : '📸'}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`tracking-tight text-sm md:text-base ${
              theme === 'pixel'
                ? 'font-pixel text-[#00ff66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)]'
                : 'font-extrabold text-gradient'
            }`}
          >
            KaBooth
          </span>
          {theme === 'pixel' && (
            <span className="arcade-badge px-1.5 py-0.5 rounded bg-[#1b1e36] text-[#00f0ff] border border-[#00f0ff]/50">
              8-BIT
            </span>
          )}
        </div>
      </div>

      {/* Right: Controls & Toggles */}
      <div className="flex items-center gap-2">
        {/* PWA Install Button (if available) */}
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallPwa}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold text-black bg-[#00ff66] hover:bg-[#00f0ff] transition-all shadow-sm active:scale-95 min-h-[36px]"
            title={t('pwa_install_prompt')}
          >
            <span>📲</span>
            <span>{t('pwa_install_btn')}</span>
          </button>
        )}

        {/* Language Switcher */}
        <div className="flex rounded bg-white/5 p-0.5 border border-white/10 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setLocale('id')}
            className={`px-2.5 py-1 rounded transition-all min-h-[32px] ${
              locale === 'id'
                ? 'bg-[#00ff66] text-black shadow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Ganti Bahasa ke Indonesia"
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-2.5 py-1 rounded transition-all min-h-[32px] ${
              locale === 'en'
                ? 'bg-[#00ff66] text-black shadow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Switch Language to English"
          >
            EN
          </button>
        </div>

        {/* Theme Switcher (Pixel Game 👾 -> Dark 🌙 -> Light ☀️) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all min-h-[36px] flex items-center gap-1.5 text-xs font-bold active:scale-95"
          title={`Tema: ${theme === 'pixel' ? t('theme_pixel') : theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
          aria-label={`Tema: ${theme === 'pixel' ? t('theme_pixel') : theme === 'dark' ? t('theme_dark') : t('theme_light')}`}
        >
          <span>{theme === 'pixel' ? '👾' : theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className={`hidden sm:inline text-[10px] ${theme === 'pixel' ? 'font-pixel text-[#00ff66]' : ''}`}>
            {theme === 'pixel' ? 'PIXEL' : theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>


        {/* Info & Legal Menu */}
        {(onOpenPrivacy || onOpenTerms) && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hidden md:block hover:text-white transition-colors px-1 py-1"
              >
                {t('legal_privacy')}
              </button>
            )}
            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="hidden md:block hover:text-white transition-colors px-1 py-1"
              >
                {t('legal_terms')}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
