/**
 * components/FilterPresetBar.tsx
 * Bar preview filter horizontal yang bisa di-scroll dengan thumbnail foto pengguna.
 */

import { useState, useEffect } from 'react'
import {
  FILTER_PRESETS,
  createFilterThumbnail,
  type FilterPresetId,
} from '../lib/photoFilters'
import { useDragScroll } from '../hooks/useDragScroll'

interface FilterPresetBarProps {
  firstPhotoUrl: string | null
  activePreset: FilterPresetId
  onSelectPreset: (preset: FilterPresetId) => void
}

export function FilterPresetBar({
  firstPhotoUrl,
  activePreset,
  onSelectPreset,
}: FilterPresetBarProps) {
  const [thumbnails, setThumbnails] = useState<Record<FilterPresetId, string>>({
    normal: '',
    bw: '',
    sepia: '',
    vintage: '',
    bright: '',
    film: '',
    cool: '',
  })

  const {
    ref: scrollRef,
    isDragging,
    canScrollLeft,
    canScrollRight,
    onMouseDown,
    onClickCapture,
    scrollByAmount,
    scrollToCenter,
  } = useDragScroll<HTMLDivElement>({
    enableWheel: true,
    dragThreshold: 5,
    enableInertia: true,
  })

  // Auto scroll active preset into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector<HTMLElement>(`#filter-preset-${activePreset}`)
      if (activeEl) {
        scrollToCenter(activeEl)
      }
    }
  }, [activePreset, scrollToCenter, scrollRef])

  useEffect(() => {
    if (!firstPhotoUrl) return

    let isCancelled = false

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      if (isCancelled) return
      try {
        const thumbEntries = await Promise.all(
          FILTER_PRESETS.map(async (preset) => {
            const thumbUrl = await createFilterThumbnail(img, preset.id, 80)
            return [preset.id, thumbUrl] as [FilterPresetId, string]
          })
        )

        if (!isCancelled) {
          const thumbMap = Object.fromEntries(thumbEntries) as Record<FilterPresetId, string>
          setThumbnails(thumbMap)
        }
      } catch (err) {
        console.warn('Gagal membuat thumbnail filter:', err)
      }
    }
    img.src = firstPhotoUrl

    return () => {
      isCancelled = true
    }
  }, [firstPhotoUrl])

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Pilihan Filter Preset
        </label>
        <span className="text-[11px] text-indigo-400 font-medium">
          {FILTER_PRESETS.find((p) => p.id === activePreset)?.name}
        </span>
      </div>

      {/* Horizontal Scrollable Thumbnails Container */}
      <div className="relative">
        {/* Tombol Scroll Kiri */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-150)}
            aria-label="Scroll preset ke kiri"
            className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-start pl-0.5 bg-gradient-to-r from-[#121218] via-[#121218]/90 to-transparent text-gray-300 hover:text-white transition-all active:scale-90"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold backdrop-blur-md shadow border border-white/10">
              ‹
            </span>
          </button>
        )}

        {/* Tombol Scroll Kanan */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(150)}
            aria-label="Scroll preset ke kanan"
            className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-end pr-0.5 bg-gradient-to-l from-[#121218] via-[#121218]/90 to-transparent text-gray-300 hover:text-white transition-all active:scale-90"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold backdrop-blur-md shadow border border-white/10">
              ›
            </span>
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onClickCapture={onClickCapture}
          className={`flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-none select-none transition-colors ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            touchAction: 'pan-x pan-y',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
          }}
        >
          {FILTER_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id
            const thumbSrc = thumbnails[preset.id]

            return (
              <button
                key={preset.id}
                id={`filter-preset-${preset.id}`}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none select-none"
              >
                {/* Thumbnail Container */}
                <div
                  className={`relative w-16 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 group-hover:scale-105 active:scale-95 shadow-md pointer-events-none select-none ${
                    isSelected
                      ? 'border-indigo-400 ring-4 ring-indigo-500/30 scale-105'
                      : 'border-white/15 opacity-80 hover:opacity-100 hover:border-white/40'
                  }`}
                  style={{ background: '#1e1e28' }}
                >
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={preset.name}
                      draggable={false}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40 select-none">
                      <span className="text-xl mb-1">{preset.icon}</span>
                      <span className="text-[9px] font-bold text-gray-300 line-clamp-1">
                        {preset.name}
                      </span>
                    </div>
                  )}

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shadow">
                      <span className="text-[9px] text-white font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-medium transition-colors select-none pointer-events-none ${
                    isSelected ? 'text-indigo-300 font-bold' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                >
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
