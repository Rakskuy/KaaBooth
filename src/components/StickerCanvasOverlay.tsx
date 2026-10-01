/**
 * components/StickerCanvasOverlay.tsx
 * Overlay interaktif untuk stiker di atas canvas preview photobooth.
 * Fitur:
 * - Multi-touch mobile gesture: 1 jari geser (drag), 2 jari cubit & putar (pinch-to-zoom & twist-to-rotate)
 * - Mouse Desktop: Drag move, handle resize & rotate, tombol hapus
 * - Posisi dan ukuran disimpan dalam koordinat relatif (0..1) agar konsisten di preview & output HD canvas
 */

import { useRef, useEffect, useCallback } from 'react'
import type { StickerItem } from '../types/sticker'

interface StickerCanvasOverlayProps {
  stickers: StickerItem[]
  selectedStickerId: string | null
  onSelectSticker: (id: string | null) => void
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void
  onRemoveSticker: (id: string) => void
  containerWidth: number
  containerHeight: number
}

export function StickerCanvasOverlay({
  stickers,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  onRemoveSticker,
  containerWidth,
  containerHeight,
}: StickerCanvasOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Dragging & gesture tracking state
  const interactionRef = useRef<{
    stickerId: string
    action: 'drag' | 'rotate' | 'scale' | 'touchGesture'
    startX: number
    startY: number
    initialStickerX: number
    initialStickerY: number
    initialRotation: number
    initialScale: number
    // Untuk 2-finger touch gesture
    initialDist?: number
    initialAngle?: number
  } | null>(null)

  // Deselect jika tap di luar stiker
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectSticker(null)
    }
  }

  // ── MOUSE EVENTS ────────────────────────────────────
  const handleMouseDownSticker = (
    e: React.MouseEvent,
    sticker: StickerItem,
    action: 'drag' | 'rotate' | 'scale'
  ) => {
    e.stopPropagation()
    e.preventDefault()
    onSelectSticker(sticker.id)

    interactionRef.current = {
      stickerId: sticker.id,
      action,
      startX: e.clientX,
      startY: e.clientY,
      initialStickerX: sticker.x,
      initialStickerY: sticker.y,
      initialRotation: sticker.rotation,
      initialScale: sticker.scale,
    }
  }

  // ── TOUCH EVENTS (Mobile 1-finger & 2-finger) ───────
  const handleTouchStartSticker = (
    e: React.TouchEvent,
    sticker: StickerItem
  ) => {
    e.stopPropagation()
    onSelectSticker(sticker.id)

    const touches = e.touches

    if (touches.length === 1) {
      // 1-finger drag
      const t0 = touches[0]
      interactionRef.current = {
        stickerId: sticker.id,
        action: 'drag',
        startX: t0.clientX,
        startY: t0.clientY,
        initialStickerX: sticker.x,
        initialStickerY: sticker.y,
        initialRotation: sticker.rotation,
        initialScale: sticker.scale,
      }
    } else if (touches.length >= 2) {
      // 2-finger pinch & rotate
      const t0 = touches[0]
      const t1 = touches[1]
      const dx = t1.clientX - t0.clientX
      const dy = t1.clientY - t0.clientY
      const dist = Math.hypot(dx, dy)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI

      interactionRef.current = {
        stickerId: sticker.id,
        action: 'touchGesture',
        startX: (t0.clientX + t1.clientX) / 2,
        startY: (t0.clientY + t1.clientY) / 2,
        initialStickerX: sticker.x,
        initialStickerY: sticker.y,
        initialRotation: sticker.rotation,
        initialScale: sticker.scale,
        initialDist: dist,
        initialAngle: angle,
      }
    }
  }

  // Window-level touch/mouse move & end listeners
  const handleGlobalMove = useCallback(
    (clientX: number, clientY: number, touches?: TouchList) => {
      const state = interactionRef.current
      if (!state || !containerWidth || !containerHeight) return

      const sticker = stickers.find((s) => s.id === state.stickerId)
      if (!sticker) return

      if (touches && touches.length >= 2) {
        // 2-finger gesture calculation
        const t0 = touches[0]
        const t1 = touches[1]
        const dx = t1.clientX - t0.clientX
        const dy = t1.clientY - t0.clientY
        const currentDist = Math.hypot(dx, dy)
        const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI

        if (state.initialDist && state.initialDist > 0 && state.initialAngle !== undefined) {
          const scaleMultiplier = currentDist / state.initialDist
          const newScale = Math.max(0.3, Math.min(3.5, state.initialScale * scaleMultiplier))

          const angleDiff = currentAngle - state.initialAngle
          const newRotation = (state.initialRotation + angleDiff + 360) % 360

          // Update position relative to center of touches
          const currentCenterX = (t0.clientX + t1.clientX) / 2
          const currentCenterY = (t0.clientY + t1.clientY) / 2
          const deltaRelX = (currentCenterX - state.startX) / containerWidth
          const deltaRelY = (currentCenterY - state.startY) / containerHeight
          const newX = Math.max(0.05, Math.min(0.95, state.initialStickerX + deltaRelX))
          const newY = Math.max(0.05, Math.min(0.95, state.initialStickerY + deltaRelY))

          onUpdateSticker(sticker.id, {
            scale: Number(newScale.toFixed(2)),
            rotation: Math.round(newRotation),
            x: Number(newX.toFixed(4)),
            y: Number(newY.toFixed(4)),
          })
        }
        return
      }

      if (state.action === 'drag') {
        const deltaX = clientX - state.startX
        const deltaY = clientY - state.startY
        const relDeltaX = deltaX / containerWidth
        const relDeltaY = deltaY / containerHeight

        const newX = Math.max(0.02, Math.min(0.98, state.initialStickerX + relDeltaX))
        const newY = Math.max(0.02, Math.min(0.98, state.initialStickerY + relDeltaY))

        onUpdateSticker(sticker.id, {
          x: Number(newX.toFixed(4)),
          y: Number(newY.toFixed(4)),
        })
      } else if (state.action === 'scale') {
        const deltaY = clientY - state.startY
        const deltaX = clientX - state.startX
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const factor = deltaY > 0 || deltaX > 0 ? dist / 80 : -dist / 80
        const newScale = Math.max(0.3, Math.min(3.5, state.initialScale + factor))

        onUpdateSticker(sticker.id, {
          scale: Number(newScale.toFixed(2)),
        })
      } else if (state.action === 'rotate') {
        const stickerScreenX = state.initialStickerX * containerWidth
        const stickerScreenY = state.initialStickerY * containerHeight
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const centerX = rect.left + stickerScreenX
          const centerY = rect.top + stickerScreenY
          const rad = Math.atan2(clientY - centerY, clientX - centerX)
          let deg = (rad * 180) / Math.PI + 90
          deg = (deg + 360) % 360
          onUpdateSticker(sticker.id, {
            rotation: Math.round(deg),
          })
        }
      }
    },
    [containerWidth, containerHeight, onUpdateSticker, stickers]
  )

  const handleGlobalEnd = useCallback(() => {
    interactionRef.current = null
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (interactionRef.current) {
        handleGlobalMove(e.clientX, e.clientY)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (interactionRef.current) {
        // Prevent scroll saat manipulasi stiker
        e.preventDefault()
        if (e.touches.length > 0) {
          handleGlobalMove(e.touches[0].clientX, e.touches[0].clientY, e.touches)
        }
      }
    }

    const onMouseUp = () => handleGlobalEnd()
    const onTouchEnd = () => handleGlobalEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [handleGlobalMove, handleGlobalEnd])

  if (!containerWidth || !containerHeight) return null

  return (
    <div
      ref={containerRef}
      id="sticker-canvas-overlay"
      onClick={handleBackgroundClick}
      className="absolute inset-0 select-none overflow-hidden touch-none"
      style={{
        width: containerWidth,
        height: containerHeight,
        pointerEvents: 'auto',
      }}
    >
      {stickers.map((sticker) => {
        const isSelected = selectedStickerId === sticker.id
        const pxX = sticker.x * containerWidth
        const pxY = sticker.y * containerHeight
        const basePixelSize = Math.max(36, containerWidth * 0.15) * sticker.scale

        return (
          <div
            key={sticker.id}
            id={`sticker-item-${sticker.id}`}
            onMouseDown={(e) => handleMouseDownSticker(e, sticker, 'drag')}
            onTouchStart={(e) => handleTouchStartSticker(e, sticker)}
            className="absolute flex items-center justify-center cursor-move transition-transform duration-75"
            style={{
              left: `${pxX}px`,
              top: `${pxY}px`,
              width: `${basePixelSize}px`,
              height: `${basePixelSize}px`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              zIndex: isSelected ? 40 : 20,
              touchAction: 'none',
            }}
          >
            {/* Sticker Visual Content */}
            <div className="w-full h-full flex items-center justify-center pointer-events-none drop-shadow-md">
              {sticker.type === 'emoji' ? (
                <span
                  style={{
                    fontSize: `${basePixelSize * 0.75}px`,
                    lineHeight: 1,
                  }}
                >
                  {sticker.content}
                </span>
              ) : sticker.type === 'svg' ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: sticker.content }}
                />
              ) : null}
            </div>

            {/* Bounding Box & Controls saat dipilih */}
            {isSelected && (
              <div className="absolute inset-0 border-2 border-indigo-400 border-dashed rounded-xl pointer-events-auto">
                {/* ❌ Tombol Hapus (Top Left) */}
                <button
                  type="button"
                  id={`btn-delete-sticker-${sticker.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveSticker(sticker.id)
                  }}
                  className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-lg active:scale-90 border-2 border-white hover:bg-red-600 transition-transform"
                >
                  ✕
                </button>

                {/* 🔄 Handle Rotasi (Top Center) */}
                <div
                  onMouseDown={(e) => handleMouseDownSticker(e, sticker, 'rotate')}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-lg cursor-grab active:cursor-grabbing border-2 border-white hover:scale-110 transition-transform"
                >
                  🔄
                </div>

                {/* ↔️ Handle Resize (Bottom Right) */}
                <div
                  onMouseDown={(e) => handleMouseDownSticker(e, sticker, 'scale')}
                  className="absolute -bottom-3.5 -right-3.5 w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-lg cursor-nwse-resize active:scale-95 border-2 border-white hover:scale-110 transition-transform"
                >
                  ↗️
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
