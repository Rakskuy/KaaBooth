/**
 * features/editor/EditorPage.tsx
 * Halaman Editor Komposisi Photobooth Lengkap (Tahap 4).
 * Fitur:
 * - Layout, Frame, Background, Teks, Logo
 * - Filter Siap Pakai (Normal, B&W, Sepia, Vintage, Cerah, Film, Dingin) dengan live photo thumbnail bar
 * - Slider Penyesuaian (Kecerahan, Kontras, Saturasi)
 * - Efek "Haluskan Kulit" alami (edge-preserving)
 * - Stiker & Emoji interaktif (gesture mobile sentuh: 1 jari geser, 2 jari cubit & putar)
 * - Generator GIF & Boomerang animasi berkecepatan tinggi menggunakan gifenc
 * - Tombol "Reset semua efek"
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { PHOTO_LAYOUTS, getLayoutById } from '../../assets/layouts'
import { PHOTO_FRAMES, getFrameById } from '../../assets/frames'
import {
  composePhotobooth,
  exportCanvasAsBlob,
  generatePhotoboothFilename,
  downloadFile,
  getDefaultDateString,
  type CustomTextOptions,
} from '../../lib/composer'
import {
  DEFAULT_FILTER_OPTIONS,
  type PhotoFilterOptions,
  type FilterPresetId,
} from '../../lib/photoFilters'
import { FilterPresetBar } from '../../components/FilterPresetBar'
import { StickerCanvasOverlay } from '../../components/StickerCanvasOverlay'
import {
  EMOJI_STICKERS,
  SVG_STICKERS,
  type StickerItem,
} from '../../types/sticker'
import { generateSessionGif, type GifMode } from '../../lib/gifGenerator'
import { useI18n } from '../../lib/i18n'
import { useDragScroll } from '../../hooks/useDragScroll'

interface EditorPageProps {
  onBack: () => void
  onNewSession: () => void
  onProceedToResult?: (canvas: HTMLCanvasElement) => void
}

type EditorTab =
  | 'layout'
  | 'frame'
  | 'filter'
  | 'stickers'
  | 'color'
  | 'text'
  | 'logo'
  | 'gif'
  | 'options'

const COLOR_PRESETS = [
  { label: 'Pixel Green', value: '#090a12', text: '#00ff66' },
  { label: 'Arcade Cyan', value: '#00f0ff', text: '#090a12' },
  { label: '8-Bit Magenta', value: '#ff007f', text: '#ffffff' },
  { label: 'Coin Gold', value: '#ffe600', text: '#090a12' },
  { label: 'GameBoy Green', value: '#8bac0f', text: '#0f380f' },
  { label: 'Midnight', value: '#121218', text: '#ffffff' },
  { label: 'Snow White', value: '#ffffff', text: '#121218' },
  { label: 'Rose Pastel', value: '#ffe4e6', text: '#881337' },
  { label: 'Vintage Cream', value: '#fef3c7', text: '#78350f' },
  { label: 'Deep Crimson', value: '#4c0519', text: '#ffffff' },
  { label: 'Charcoal', value: '#1e293b', text: '#ffffff' },
]

const FONT_OPTIONS = [
  { id: 'Press Start 2P', name: '👾 8-Bit Pixel', style: { fontFamily: '"Press Start 2P", monospace' } },
  { id: 'VT323', name: '🕹️ Arcade Terminal', style: { fontFamily: '"VT323", monospace' } },
  { id: 'Outfit', name: 'Modern (Outfit)', style: { fontFamily: 'Outfit, sans-serif' } },
  { id: 'Playfair Display', name: 'Elegant (Playfair)', style: { fontFamily: '"Playfair Display", serif' } },
  { id: 'Pacifico', name: 'Cute (Pacifico)', style: { fontFamily: 'Pacifico, cursive' } },
  { id: 'Space Grotesk', name: 'Y2K Retro (Space Grotesk)', style: { fontFamily: '"Space Grotesk", sans-serif' } },
  { id: 'Plus Jakarta Sans', name: 'Clean (Jakarta)', style: { fontFamily: '"Plus Jakarta Sans", sans-serif' } },
]


export function EditorPage({ onBack, onNewSession, onProceedToResult }: EditorPageProps) {
  const { t } = useI18n()
  const { photos, photoCount } = useSessionStore()

  // Default layout sesuai jumlah foto sesi
  const initialLayoutId = useMemo(() => {
    if (photoCount === 1) return 'single'
    if (photoCount === 3) return 'vertical-3'
    return 'vertical-4'
  }, [photoCount])

  /* ── State Konfigurasi Editor ──────────────────────── */
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(initialLayoutId)
  const [selectedFrameId, setSelectedFrameId] = useState<string>('clean')
  const [bgColor, setBgColor] = useState<string>('#121218')
  const [activeTab, setActiveTab] = useState<EditorTab>('filter')

  /* ── Tab Navigation Drag & Touch Scroll ─────────────── */
  const {
    ref: tabNavRef,
    isDragging: isTabDragging,
    canScrollLeft: canTabScrollLeft,
    canScrollRight: canTabScrollRight,
    onMouseDown: onTabMouseDown,
    onClickCapture: onTabClickCapture,
    scrollByAmount: scrollTabBy,
    scrollToCenter: scrollTabToCenter,
  } = useDragScroll<HTMLDivElement>({
    enableWheel: true,
    dragThreshold: 5,
    enableInertia: true,
  })

  // Auto-scroll tab aktif ke posisi tengah saat berganti tab
  useEffect(() => {
    if (tabNavRef.current) {
      const activeBtn = tabNavRef.current.querySelector<HTMLElement>(`#tab-${activeTab}`)
      if (activeBtn) {
        scrollTabToCenter(activeBtn)
      }
    }
  }, [activeTab, scrollTabToCenter, tabNavRef])

  // Text state
  const [title, setTitle] = useState<string>('KaBooth Moments')
  const [showDate, setShowDate] = useState<boolean>(true)
  const [customDate, setCustomDate] = useState<string>(getDefaultDateString())
  const [fontFamily, setFontFamily] = useState<string>('Outfit')
  const [textColor, setTextColor] = useState<string>('#ffffff')

  // Logo & Mirror state
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [mirrorPhotos, setMirrorPhotos] = useState<boolean>(false)

  // Tahap 4: Filter & Adjustments State
  const [filterOptions, setFilterOptions] = useState<PhotoFilterOptions>(DEFAULT_FILTER_OPTIONS)

  // Tahap 4: Stickers State
  const [stickers, setStickers] = useState<StickerItem[]>([])
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [stickerCatalogTab, setStickerCatalogTab] = useState<'emoji' | 'svg'>('emoji')

  // Tahap 4: GIF State
  const [gifMode, setGifMode] = useState<GifMode>('boomerang')
  const [gifSpeedMs, setGifSpeedMs] = useState<number>(350)
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false)
  const [gifProgress, setGifProgress] = useState<number>(0)

  // Canvas preview ref & export state
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const [canvasDisplaySize, setCanvasDisplaySize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isRenderingPreview, setIsRenderingPreview] = useState<boolean>(false)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const currentLayout = useMemo(() => getLayoutById(selectedLayoutId), [selectedLayoutId])
  const currentFrame = useMemo(() => getFrameById(selectedFrameId), [selectedFrameId])

  // Foto pertama untuk thumbnail filter
  const firstPhotoUrl = useMemo(() => {
    return photos.find((p) => Boolean(p)) || null
  }, [photos])

  /* ── Sync Ukuran Tampilan Canvas untuk Overlay Stiker ── */
  const updateCanvasDisplaySize = useCallback(() => {
    if (previewCanvasRef.current) {
      const rect = previewCanvasRef.current.getBoundingClientRect()
      setCanvasDisplaySize({
        width: rect.width,
        height: rect.height,
      })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateCanvasDisplaySize)
    return () => window.removeEventListener('resize', updateCanvasDisplaySize)
  }, [updateCanvasDisplaySize])

  const stickerCounterRef = useRef(0)

  /* ── Render Live Preview ke Canvas ─────────────────── */
  useEffect(() => {
    let isCancelled = false

    const textOptions: CustomTextOptions = {
      title,
      showDate,
      dateString: customDate,
      fontFamily,
      textColor,
    }

    // Debounce preview rendering ringan saat drag slider
    const timer = setTimeout(() => {
      setIsRenderingPreview(true)
      composePhotobooth({
        photos,
        layout: currentLayout,
        frame: currentFrame,
        backgroundColor: bgColor,
        customText: textOptions,
        logo: logoDataUrl,
        mirror: mirrorPhotos,
        filterOptions,
      })
        .then((composedCanvas) => {
          if (isCancelled) return
          const targetCanvas = previewCanvasRef.current
          if (!targetCanvas) return

          targetCanvas.width = composedCanvas.width
          targetCanvas.height = composedCanvas.height
          const targetCtx = targetCanvas.getContext('2d')
          if (targetCtx) {
            targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
            targetCtx.drawImage(composedCanvas, 0, 0)
          }
          setIsRenderingPreview(false)
          // Beri jeda 1 frame untuk sync display dimensions
          requestAnimationFrame(updateCanvasDisplaySize)
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error('Error saat compose preview:', err)
            setIsRenderingPreview(false)
          }
        })
    }, 40)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [
    photos,
    currentLayout,
    currentFrame,
    bgColor,
    title,
    showDate,
    customDate,
    fontFamily,
    textColor,
    logoDataUrl,
    mirrorPhotos,
    filterOptions,
    updateCanvasDisplaySize,
  ])

  /* ── Handler Upload Logo ───────────────────────────── */
  const handleLogoUpload = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) setLogoDataUrl(result)
    }
    reader.readAsDataURL(file)
  }

  /* ── Handler Tambah Stiker ─────────────────────────── */
  const handleAddSticker = useCallback((type: 'emoji' | 'svg', content: string) => {
    stickerCounterRef.current += 1
    const count = stickerCounterRef.current
    const offset = ((count % 5) - 2) * 0.04
    const newSticker: StickerItem = {
      id: `sticker-${count}-${Date.now()}`,
      type,
      content,
      x: 0.5 + offset,
      y: 0.5 + offset,
      scale: 1.0,
      rotation: 0,
      size: 64,
    }
    setStickers((prev) => [...prev, newSticker])
    setSelectedStickerId(newSticker.id)
  }, [])

  const handleUpdateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id))
    if (selectedStickerId === id) setSelectedStickerId(null)
  }

  const handleClearAllStickers = () => {
    setStickers([])
    setSelectedStickerId(null)
  }

  /* ── Handler Reset Semua Efek ──────────────────────── */
  const handleResetEffects = () => {
    setFilterOptions({ ...DEFAULT_FILTER_OPTIONS })
  }

  /* ── Handler Download File Foto Strip ──────────────── */
  const handleDownload = async (format: 'image/png' | 'image/jpeg') => {
    try {
      setIsExporting(true)
      const textOptions: CustomTextOptions = {
        title,
        showDate,
        dateString: customDate,
        fontFamily,
        textColor,
      }

      // Render kanvas resolusi penuh lengkap dengan filter dan semua stiker!
      const fullCanvas = await composePhotobooth({
        photos,
        layout: currentLayout,
        frame: currentFrame,
        backgroundColor: bgColor,
        customText: textOptions,
        logo: logoDataUrl,
        mirror: mirrorPhotos,
        filterOptions,
        stickers,
      })

      const ext = format === 'image/png' ? 'png' : 'jpg'
      const filename = generatePhotoboothFilename(ext)
      const blob = await exportCanvasAsBlob(fullCanvas, format, 0.96)

      downloadFile(blob, filename)
    } catch (err) {
      console.error('Gagal mengunduh file:', err)
      alert('Terjadi kesalahan saat mengunduh foto.')
    } finally {
      setIsExporting(false)
    }
  }

  /* ── Handler Lanjut ke Halaman Hasil & Berbagi ─────── */
  const handleProceedToResult = async () => {
    try {
      setIsExporting(true)
      const textOptions: CustomTextOptions = {
        title,
        showDate,
        dateString: customDate,
        fontFamily,
        textColor,
      }

      const fullCanvas = await composePhotobooth({
        photos,
        layout: currentLayout,
        frame: currentFrame,
        backgroundColor: bgColor,
        customText: textOptions,
        logo: logoDataUrl,
        mirror: mirrorPhotos,
        filterOptions,
        stickers,
      })

      if (onProceedToResult) {
        onProceedToResult(fullCanvas)
      }
    } catch (err) {
      console.error('Gagal memproses hasil photobooth:', err)
      alert('Terjadi kesalahan saat menyiapkan hasil foto.')
    } finally {
      setIsExporting(false)
    }
  }

  /* ── Handler Unduh Animasi GIF / Boomerang ──────────── */
  const handleDownloadGif = async () => {
    try {
      setIsGeneratingGif(true)
      setGifProgress(0)

      const result = await generateSessionGif({
        photos,
        filterOptions,
        stickers,
        mode: gifMode,
        delayMs: gifSpeedMs,
        maxWidth: 600,
        onProgress: (p) => setGifProgress(p),
      })

      const filename = generatePhotoboothFilename('gif')
      downloadFile(result.blob, filename)
    } catch (err) {
      console.error('Gagal membuat GIF:', err)
      alert('Gagal membuat GIF animasi. Pastikan terdapat foto pada sesi.')
    } finally {
      setIsGeneratingGif(false)
      setGifProgress(0)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] w-full" style={{ background: 'var(--c-bg)' }}>
      {/* ── Top Header ───────────────────────────────── */}
      <header
        className="w-full flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: 'rgba(13, 13, 20, 0.85)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            id="btn-editor-back"
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{
              background: 'var(--c-surface2)',
              color: 'var(--c-text)',
              border: '1px solid var(--c-border)',
            }}
          >
            ← {t('nav_back')}
          </button>
          <h1 className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>{t('editor_title')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Tahap 4
            </span>
          </h1>
        </div>

        <button
          id="btn-editor-new-session"
          type="button"
          onClick={onNewSession}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {t('editor_retake_session')}
        </button>
      </header>

      {/* ── Main Layout (Responsive 2 Columns on Desktop) ─ */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto overflow-hidden">
        {/* ── Left Column: Preview Canvas ──────────────── */}
        <section
          className="flex-1 flex flex-col items-center justify-center p-3 md:p-8 relative min-h-[380px] lg:min-h-auto overflow-y-auto"
          style={{ background: 'radial-gradient(circle at center, #1b1b26 0%, #0d0d14 100%)' }}
        >
          {/* Canvas Wrapper dengan Shadow & Border Mewah */}
          <div
            ref={canvasContainerRef}
            className="relative flex items-center justify-center max-w-full max-h-[66vh] rounded-2xl p-1 transition-all duration-300"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
            }}
          >
            <div className="relative inline-block overflow-hidden rounded-xl">
              <canvas
                ref={previewCanvasRef}
                id="photobooth-preview-canvas"
                className="max-h-[60vh] max-w-full object-contain block transition-opacity duration-200"
                style={{
                  opacity: isRenderingPreview ? 0.75 : 1,
                }}
              />

              {/* Overlay Stiker Interaktif yang berada tepat di atas canvas */}
              {canvasDisplaySize.width > 0 && canvasDisplaySize.height > 0 && (
                <StickerCanvasOverlay
                  stickers={stickers}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onUpdateSticker={handleUpdateSticker}
                  onRemoveSticker={handleRemoveSticker}
                  containerWidth={canvasDisplaySize.width}
                  containerHeight={canvasDisplaySize.height}
                />
              )}
            </div>

            {/* Spinner rendering overlay kecil */}
            {isRenderingPreview && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="animate-spin text-2xl">⏳</span>
              </div>
            )}
          </div>

          {/* Info Status & Hint Bar */}
          <div className="mt-2.5 flex items-center gap-3 text-xs" style={{ color: 'var(--c-muted)' }}>
            <span className="uppercase tracking-wider font-semibold">
              {currentLayout.name} • {currentLayout.aspectRatioLabel}
            </span>
            {stickers.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-indigo-300">
                {stickers.length} stiker aktif
              </span>
            )}
          </div>
        </section>

        {/* ── Right Column: Controls & Customization Panel ─ */}
        <aside
          className="w-full lg:w-[440px] xl:w-[480px] flex flex-col border-t lg:border-t-0 lg:border-l flex-shrink-0"
          style={{
            background: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          {/* Navigation Tabs (Scrollable & Draggable with Mouse / Touch) */}
          <div className="relative border-b" style={{ borderColor: 'var(--c-border)' }}>
            {/* Tombol Navigasi Scroll Kiri */}
            {canTabScrollLeft && (
              <button
                type="button"
                onClick={() => scrollTabBy(-180)}
                aria-label="Scroll tab ke kiri"
                className="absolute left-0 top-0 bottom-0 z-10 w-9 flex items-center justify-start pl-1 bg-gradient-to-r from-[var(--c-surface)] via-[var(--c-surface)]/90 to-transparent text-gray-300 hover:text-white transition-all active:scale-90"
              >
                <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold backdrop-blur-md shadow-md border border-white/10">
                  ‹
                </span>
              </button>
            )}

            {/* Tombol Navigasi Scroll Kanan */}
            {canTabScrollRight && (
              <button
                type="button"
                onClick={() => scrollTabBy(180)}
                aria-label="Scroll tab ke kanan"
                className="absolute right-0 top-0 bottom-0 z-10 w-9 flex items-center justify-end pr-1 bg-gradient-to-l from-[var(--c-surface)] via-[var(--c-surface)]/90 to-transparent text-gray-300 hover:text-white transition-all active:scale-90"
              >
                <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold backdrop-blur-md shadow-md border border-white/10">
                  ›
                </span>
              </button>
            )}

            {/* Kontainer Tab: Drag dengan Mouse + Sentuhan Layar Touch */}
            <div
              ref={tabNavRef}
              onMouseDown={onTabMouseDown}
              onClickCapture={onTabClickCapture}
              className={`flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none select-none transition-colors ${
                isTabDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                touchAction: 'pan-x pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorX: 'contain',
              }}
            >
              {(
                [
                  { id: 'filter', icon: '🪄', label: t('editor_tab_filter') },
                  { id: 'stickers', icon: '🎀', label: t('editor_tab_stickers') },
                  { id: 'layout', icon: '📐', label: t('editor_tab_layout') },
                  { id: 'frame', icon: '🖼️', label: t('editor_tab_frame') },
                  { id: 'gif', icon: '🎬', label: t('editor_tab_gif') },
                  { id: 'color', icon: '🎨', label: t('editor_tab_bg') },
                  { id: 'text', icon: '✏️', label: t('editor_tab_text') },
                  { id: 'logo', icon: '🏷️', label: t('editor_tab_logo') },
                  { id: 'options', icon: '⚙️', label: t('editor_tab_options') },
                ] as { id: EditorTab; icon: string; label: string }[]
              ).map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 select-none ${
                      isActive
                        ? 'text-white shadow-sm ring-1 ring-white/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 active:scale-95'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, var(--c-primary), var(--c-primary2))'
                        : 'transparent',
                    }}
                  >
                    <span className="pointer-events-none select-none">{tab.icon}</span>
                    <span className="pointer-events-none select-none">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-h-[46vh] lg:max-h-[calc(100dvh-175px)]">
            {/* ── TAB: FILTER & PENYESUAIAN (TAHAP 4) ──── */}
            {activeTab === 'filter' && (
              <div className="space-y-6">
                {/* 1. Bar Thumbnail Filter Preset */}
                <FilterPresetBar
                  firstPhotoUrl={firstPhotoUrl}
                  activePreset={filterOptions.preset}
                  onSelectPreset={(p: FilterPresetId) =>
                    setFilterOptions((prev) => ({ ...prev, preset: p }))
                  }
                />

                {/* 2. Sliders Penyesuaian Visual */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      {t('editor_filter_adjust_title')}
                    </h3>
                    <button
                      id="btn-reset-filters"
                      type="button"
                      onClick={handleResetEffects}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all"
                    >
                      🔄 {t('editor_reset_effects')}
                    </button>
                  </div>

                  {/* Slider Kecerahan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <span>☀️</span>
                        <span>{t('editor_brightness')}</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-medium">
                        {filterOptions.brightness > 0 ? `+${filterOptions.brightness}` : filterOptions.brightness}
                      </span>
                    </div>
                    <input
                      type="range"
                      id="slider-brightness"
                      min="-50"
                      max="50"
                      value={filterOptions.brightness}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          brightness: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider Kontras */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <span>🌓</span>
                        <span>{t('editor_contrast')}</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-medium">
                        {filterOptions.contrast > 0 ? `+${filterOptions.contrast}` : filterOptions.contrast}
                      </span>
                    </div>
                    <input
                      type="range"
                      id="slider-contrast"
                      min="-50"
                      max="50"
                      value={filterOptions.contrast}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          contrast: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider Saturasi */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <span>🎨</span>
                        <span>{t('editor_saturation')}</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-medium">
                        {filterOptions.saturation > 0 ? `+${filterOptions.saturation}` : filterOptions.saturation}
                      </span>
                    </div>
                    <input
                      type="range"
                      id="slider-saturation"
                      min="-50"
                      max="50"
                      value={filterOptions.saturation}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          saturation: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider Haluskan Kulit Alami (Skin Smoothing) */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <span>✨</span>
                        <span className="font-semibold text-white">{t('editor_smooth_skin')}</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-medium">
                        {filterOptions.smoothSkin}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t('editor_smooth_skin_hint')}
                    </p>
                    <input
                      type="range"
                      id="slider-smooth-skin"
                      min="0"
                      max="100"
                      value={filterOptions.smoothSkin}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          smoothSkin: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: STIKER & EMOJI (TAHAP 4) ────────── */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t('editor_stickers_title')}
                  </h3>
                  {stickers.length > 0 && (
                    <button
                      id="btn-clear-all-stickers"
                      type="button"
                      onClick={handleClearAllStickers}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all"
                    >
                      🗑️ {t('editor_stickers_clear_all')}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('editor_stickers_hint')}
                </p>

                {/* Sub-tabs: Emoji vs SVG */}
                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setStickerCatalogTab('emoji')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      stickerCatalogTab === 'emoji'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('editor_stickers_tab_emoji')} ({EMOJI_STICKERS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStickerCatalogTab('svg')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      stickerCatalogTab === 'svg'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('editor_stickers_tab_svg')} ({SVG_STICKERS.length})
                  </button>
                </div>

                {/* Grid Katalog Stiker */}
                <div className="grid grid-cols-5 gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 max-h-[220px] overflow-y-auto">
                  {stickerCatalogTab === 'emoji' &&
                    EMOJI_STICKERS.map((item) => (
                      <button
                        key={item.id}
                        id={`btn-add-emoji-${item.id}`}
                        type="button"
                        onClick={() => handleAddSticker('emoji', item.content)}
                        className="h-12 flex items-center justify-center text-2xl rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 transition-all border border-white/5 hover:border-white/20"
                        title={item.label}
                      >
                        {item.preview}
                      </button>
                    ))}

                  {stickerCatalogTab === 'svg' &&
                    SVG_STICKERS.map((item) => (
                      <button
                        key={item.id}
                        id={`btn-add-svg-${item.id}`}
                        type="button"
                        onClick={() => handleAddSticker('svg', item.content)}
                        className="h-12 flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 transition-all border border-white/5 hover:border-white/20"
                        title={item.label}
                      >
                        <div
                          className="w-8 h-8 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </button>
                    ))}
                </div>

                {/* Stiker Aktif List */}
                {stickers.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                      Stiker Terpasang ({stickers.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stickers.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStickerId(s.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                            selectedStickerId === s.id
                              ? 'border-indigo-400 bg-indigo-500/20 text-white ring-2 ring-indigo-500/30'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span>
                            {s.type === 'emoji' ? s.content : `Stiker ${idx + 1}`}
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveSticker(s.id)
                            }}
                            className="text-red-400 hover:text-red-300 font-bold ml-1"
                          >
                            ✕
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: GIF & BOOMERANG (TAHAP 4) ───────── */}
            {activeTab === 'gif' && (
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('editor_gif_title')}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('editor_gif_desc')}
                </p>

                {/* Mode Pilihan: Sequence vs Boomerang */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 block">
                    Format Animasi
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      id="opt-gif-boomerang"
                      onClick={() => setGifMode('boomerang')}
                      className={`p-3 rounded-2xl border text-left flex flex-col transition-all ${
                        gifMode === 'boomerang'
                          ? 'border-indigo-500 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-bold mb-0.5">🪃 Boomerang</span>
                      <span className="text-[10px] opacity-80">Maju - Mundur berulang</span>
                    </button>

                    <button
                      type="button"
                      id="opt-gif-sequence"
                      onClick={() => setGifMode('sequence')}
                      className={`p-3 rounded-2xl border text-left flex flex-col transition-all ${
                        gifMode === 'sequence'
                          ? 'border-indigo-500 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-bold mb-0.5">⏱️ Sequence</span>
                      <span className="text-[10px] opacity-80">Urutan normal (1-2-3-4)</span>
                    </button>
                  </div>
                </div>

                {/* Pilihan Kecepatan */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 block">
                    Kecepatan Pergantian Frame
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: t('editor_gif_speed_slow'), value: 500 },
                      { label: t('editor_gif_speed_normal'), value: 350 },
                      { label: t('editor_gif_speed_fast'), value: 200 },
                    ].map((spd) => (
                      <button
                        key={spd.value}
                        type="button"
                        onClick={() => setGifSpeedMs(spd.value)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          gifSpeedMs === spd.value
                            ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {spd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tombol Unduh GIF Terpisah */}
                <div className="pt-2">
                  <button
                    id="btn-download-gif"
                    type="button"
                    disabled={isGeneratingGif}
                    onClick={handleDownloadGif}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                      boxShadow: '0 8px 24px -4px rgba(236, 72, 153, 0.4)',
                    }}
                  >
                    <span>{isGeneratingGif ? '⏳' : '🎬'}</span>
                    <span>
                      {isGeneratingGif
                        ? t('editor_gif_generating', { progress: gifProgress })
                        : t('editor_gif_download_btn')}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 1: LAYOUT ────────────────────────── */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('editor_layout_select')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {PHOTO_LAYOUTS.map((layout) => {
                    const isSelected = selectedLayoutId === layout.id
                    return (
                      <button
                        key={layout.id}
                        id={`layout-opt-${layout.id}`}
                        type="button"
                        onClick={() => setSelectedLayoutId(layout.id)}
                        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-150 relative ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold text-white mb-1">
                          {layout.name}
                        </span>
                        <span className="text-[11px] text-gray-400 leading-snug">
                          {layout.description}
                        </span>
                        <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                          <span>{layout.aspectRatioLabel}</span>
                          <span>{layout.photoCount} foto</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 2: FRAME ─────────────────────────── */}
            {activeTab === 'frame' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('editor_frame_select')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {PHOTO_FRAMES.map((frame) => {
                    const isSelected = selectedFrameId === frame.id
                    return (
                      <button
                        key={frame.id}
                        id={`frame-opt-${frame.id}`}
                        type="button"
                        onClick={() => setSelectedFrameId(frame.id)}
                        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-150 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{frame.icon}</span>
                          <span className="text-xs font-bold text-white">
                            {frame.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 leading-snug">
                          {frame.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 3: BACKGROUND COLOR ──────────────── */}
            {activeTab === 'color' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    {t('editor_bg_presets')}
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = bgColor.toLowerCase() === preset.value.toLowerCase()
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            setBgColor(preset.value)
                            setTextColor(preset.text)
                          }}
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          <div
                            className={`w-11 h-11 rounded-full border-2 transition-transform duration-150 active:scale-90 flex items-center justify-center shadow-md ${
                              isSelected
                                ? 'border-indigo-400 scale-110 ring-4 ring-indigo-500/20'
                                : 'border-white/20 group-hover:scale-105'
                            }`}
                            style={{ background: preset.value }}
                          >
                            {isSelected && (
                              <span
                                className="text-xs font-bold"
                                style={{ color: preset.text }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 truncate max-w-full">
                            {preset.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
                    {t('editor_custom_color')}
                  </label>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="color"
                      id="input-bg-color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-white flex-1">{bgColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: TEKS & TYPOGRAPHY ─────────────── */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                    {t('editor_text_title')}
                  </label>
                  <input
                    type="text"
                    id="input-text-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('editor_text_placeholder')}
                    maxLength={40}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Font Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                    {t('editor_text_font')}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = fontFamily === f.id
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontFamily(f.id)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/15 text-white'
                              : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span style={f.style}>{f.name}</span>
                          {isSelected && <span className="text-indigo-400 text-xs">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Text Color Picker */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                    {t('editor_text_color')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="input-text-color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-2">
                      {['#ffffff', '#121218', '#fbbf24', '#f43f5e', '#60a5fa'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          className="w-7 h-7 rounded-full border border-white/20"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Toggle & Input */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-white">
                      {t('editor_text_date_toggle')}
                    </span>
                    <input
                      type="checkbox"
                      id="toggle-show-date"
                      checked={showDate}
                      onChange={(e) => setShowDate(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  {showDate && (
                    <input
                      type="text"
                      id="input-custom-date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="DD.MM.YYYY"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 5: LOGO ──────────────────────────── */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('editor_logo_upload')}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('editor_logo_hint')}
                </p>

                {logoDataUrl ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <img
                      src={logoDataUrl}
                      alt="Logo Event"
                      className="h-10 max-w-[120px] object-contain rounded bg-black/20 p-1"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
                      >
                        {t('editor_logo_change')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoDataUrl(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      >
                        {t('editor_logo_remove')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="btn-upload-logo"
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-white/5 transition-all text-gray-400 hover:text-white"
                  >
                    <span className="text-3xl">🏷️</span>
                    <span className="text-xs font-semibold">{t('editor_logo_upload')}</span>
                  </button>
                )}

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
              </div>
            )}

            {/* ── TAB 6: OPTIONS (MIRROR, DLL) ─────────── */}
            {activeTab === 'options' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">
                        {t('editor_mirror_toggle')}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {t('editor_mirror_desc')}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      id="toggle-mirror-photos"
                      checked={mirrorPhotos}
                      onChange={(e) => setMirrorPhotos(e.target.checked)}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Action & Download Buttons ─────────── */}
          <div
            className="p-4 border-t space-y-2.5 backdrop-blur-md"
            style={{
              background: 'rgba(18, 18, 26, 0.95)',
              borderColor: 'var(--c-border)',
            }}
          >
            {/* Primary Action: Lanjut ke Halaman Hasil & Berbagi */}
            <button
              id="btn-proceed-to-result"
              type="button"
              disabled={isExporting}
              onClick={handleProceedToResult}
              className="w-full py-4 rounded-2xl text-sm md:text-base font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <span>{isExporting ? '⏳' : '🚀'}</span>
              <span>{isExporting ? t('editor_btn_downloading') : t('editor_proceed_to_result')}</span>
            </button>

            {/* Quick Download Action Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-download-png"
                type="button"
                disabled={isExporting}
                onClick={() => handleDownload('image/png')}
                className="py-2.5 rounded-xl text-xs font-semibold text-gray-200 transition-all duration-150 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 border border-white/10"
              >
                <span>📥</span>
                <span>{t('editor_btn_download_png')}</span>
              </button>

              <button
                id="btn-download-jpg"
                type="button"
                disabled={isExporting}
                onClick={() => handleDownload('image/jpeg')}
                className="py-2.5 rounded-xl text-xs font-semibold text-gray-200 transition-all duration-150 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 border border-white/10"
              >
                <span>🖼️</span>
                <span>{t('editor_btn_download_jpg')}</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
