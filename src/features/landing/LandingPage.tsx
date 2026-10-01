/**
 * features/landing/LandingPage.tsx
 * Halaman utama aplikasi SnapBooth.
 * Menampilkan animasi karakter pixel lucu (Neko Cat, Mushroom, Froggy, Coin),
 * status bar HUD arcade 8-bit, judul, dan tombol CTA bertema pixel.
 */

import { useState } from 'react'
import { PrivacyConsentModal } from '../../components/PrivacyConsentModal'
import {
  hasAcceptedPrivacyConsent,
  savePrivacyConsent,
} from '../../lib/privacyConsent'
import { useI18n } from '../../lib/i18n'
import { PixelInstagramIcon } from '../../components/PixelInstagramIcon'

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, locale } = useI18n()
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false)
  const [activeSpeech, setActiveSpeech] = useState<string>(
    locale === 'en' ? 'NYAN! 🐾' : 'MEONG! 🐾'
  )

  const handleStartClick = () => {
    if (hasAcceptedPrivacyConsent()) {
      onStart()
    } else {
      setShowConsentModal(true)
    }
  }

  const handleAcceptConsent = () => {
    savePrivacyConsent()
    setShowConsentModal(false)
    onStart()
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-8 relative overflow-hidden select-none">
      {/* ── 1. Top Arcade HUD Bar ──────────────────────── */}
      <div className="w-full max-w-md mx-auto mb-3 flex items-center justify-between px-3 py-1.5 rounded bg-[#121424] border border-[#00ff66]/40 text-[10px] font-pixel text-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.15)] z-20">
        <span className="flex items-center gap-1">
          <span className="animate-pulse">★</span> WORLD 1-1
        </span>
        <span className="text-[#ffe600] flex items-center gap-1">
          <span className="inline-block animate-pixel-spin">🪙</span> x99
        </span>
        <span className="text-[#00f0ff]">HI: 99990</span>
      </div>

      {/* ── 2. Floating Animated Pixel Characters ─────── */}
      {/* Top Left: Animated Pixel Neko Cat with Speech */}
      <div
        onClick={() => setActiveSpeech('NYAAN! ✨')}
        className="absolute top-16 left-4 md:left-12 z-20 flex flex-col items-center cursor-pointer group"
      >
        <div className="text-[10px] font-pixel bg-white text-black px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1 animate-pixel-bob">
          {activeSpeech}
        </div>
        <div className="text-3xl md:text-4xl animate-pixel-bob filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125">
          🐱
        </div>
      </div>

      {/* Top Right: Bouncing 8-Bit Power Mushroom */}
      <div
        onClick={() => setActiveSpeech('POWER UP! 🍄')}
        className="absolute top-16 right-4 md:right-12 z-20 flex flex-col items-center cursor-pointer group"
      >
        <div className="text-3xl md:text-4xl animate-pixel-hop filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125">
          🍄
        </div>
        <div className="w-8 h-2 bg-[#8b4513] border border-black rounded-sm mt-1" />
      </div>

      {/* Bottom Left: Cute Pixel Froggy & Floating Heart */}
      <div
        onClick={() => setActiveSpeech('RIBBIT! 🐸')}
        className="absolute bottom-12 left-4 md:left-14 z-20 flex flex-col items-center cursor-pointer group"
      >
        <div className="text-xs animate-pixel-float text-[#ff0055]">💖</div>
        <div className="text-3xl md:text-4xl animate-pixel-hop filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125">
          🐸
        </div>
      </div>

      {/* Bottom Right: Spinning Pixel Coin +100 */}
      <div
        onClick={() => setActiveSpeech('BONUS! +100🪙')}
        className="absolute bottom-12 right-4 md:right-14 z-20 flex flex-col items-center cursor-pointer group"
      >
        <div className="text-[9px] font-pixel text-[#00ff66] animate-pixel-float">
          +100
        </div>
        <div className="text-3xl md:text-4xl animate-pixel-spin filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125">
          🪙
        </div>
      </div>

      {/* Floating Background Sparkle Stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <span className="absolute top-[28%] left-[18%] text-lg animate-pixel-bob text-[#ffe600]">⭐</span>
        <span className="absolute top-[35%] right-[22%] text-sm animate-pixel-hop text-[#00f0ff]">✨</span>
        <span className="absolute bottom-[30%] left-[25%] text-sm animate-pixel-bob text-[#ff007f]">🌸</span>
        <span className="absolute bottom-[25%] right-[20%] text-base animate-pixel-hop text-[#00ff66]">👾</span>
      </div>

      {/* ── 3. Main Card ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center gap-5 w-full max-w-md glass-card p-6 md:p-8">
        {/* Animated Pixel Camera Box */}
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl animate-pixel-bob"
          style={{
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
            boxShadow: 'var(--shadow-glow), 4px 4px 0px #000000',
            border: '2px solid #000000',
          }}
          aria-hidden="true"
        >
          <span>📸</span>
          {/* Blinking Red REC Light */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#00ff66] font-pixel drop-shadow-[2px_2px_0px_#000]">
            KaBooth
          </h1>

          <p
            className="text-xs md:text-sm leading-relaxed max-w-xs font-medium"
            style={{ color: 'var(--c-muted)' }}
          >
            {t('landing_subtitle')}
          </p>
        </div>

        {/* 8-Bit Feature badges */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {(locale === 'en'
            ? [
                '⏱️ AUTO COUNTDOWN',
                '🖼️ 8-BIT FRAMES',
                '🎨 PIXEL STICKERS',
                '🚀 SHARE & GIF',
              ]
            : [
                '⏱️ HITUNG MUNDUR',
                '🖼️ BINGKAI 8-BIT',
                '🎨 STIKER PIXEL',
                '🚀 BAGIKAN & GIF',
              ]
          ).map((feat) => (
            <span
              key={feat}
              className="text-[9px] font-pixel px-2 py-1 rounded bg-[#1b1e36] text-[#00f0ff] border border-[#00f0ff]/40 shadow-[2px_2px_0px_#000]"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* 8-Bit CTA button */}
        <button
          id="btn-start-photo"
          type="button"
          onClick={handleStartClick}
          className="w-full py-4 px-6 rounded text-sm md:text-base font-pixel text-black bg-[#00ff66] hover:bg-[#00f0ff] active:translate-x-[2px] active:translate-y-[2px] transition-all shadow-[4px_4px_0px_#000] border-2 border-black flex items-center justify-center gap-2 group"
          aria-label={locale === 'en' ? 'Start taking photos' : 'Mulai mengambil foto'}
        >
          <span className="inline-block group-hover:translate-x-1 transition-transform animate-pixel-blink">
            ▶
          </span>
          <span>{locale === 'en' ? 'PRESS START' : 'MULAI FOTO'}</span>
          <span className="text-xs">🎬</span>
        </button>

        {/* ── Creator KaaBooth Instagram Badge (Horizontal Single-Row) ── */}
        <a
          href="https://www.instagram.com/mhmmdrakak?stkn=dTI3endmN3NzZWh0"
          target="_blank"
          rel="noopener noreferrer"
          id="btn-admin-ig-landing"
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#121424] hover:bg-[#1a1c36] border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all group whitespace-nowrap overflow-hidden"
          title="Instagram Creator KaaBooth: @mhmmdrakak"
          aria-label="Instagram Creator KaaBooth: @mhmmdrakak"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/60 border border-[#00f0ff]/50 flex items-center justify-center p-1 group-hover:scale-105 group-hover:border-[#00ff66] transition-all flex-shrink-0">
            <PixelInstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 text-left">
            <span className="text-[9px] sm:text-[10px] font-pixel text-[#00ff66]">
              👑 Creator KaaBooth
            </span>
            <span className="text-gray-500 font-mono text-xs">•</span>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-200 group-hover:text-white transition-colors">
              @mhmmdrakak
            </span>
          </div>
        </a>

        {/* Privacy note */}
        <p
          className="text-[11px] leading-relaxed flex items-start gap-1.5 text-left cursor-pointer hover:opacity-90"
          onClick={() => setShowConsentModal(true)}
          style={{ color: 'var(--c-muted)' }}
        >
          <span aria-hidden="true" className="flex-shrink-0">🔒</span>
          <span>{t('landing_privacy')}</span>
        </p>
      </div>

      {/* Privacy Consent Modal */}
      <PrivacyConsentModal
        isOpen={showConsentModal}
        onAccept={handleAcceptConsent}
      />
    </main>
  )
}

