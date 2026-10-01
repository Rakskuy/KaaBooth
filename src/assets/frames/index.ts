/**
 * assets/frames/index.ts
 * Sistem Frame/Template Photobooth:
 * - Frame transparan ditumpuk di atas foto.
 * - Digambar secara dinamis/vektorial ke kanvas resolusi tinggi sehingga tajam di semua ukuran kanvas.
 * - Menyediakan: Polos, Ulang Tahun, Minimalis Film, Cinta/Romantic, dan Retro Y2K.
 */

import type { LayoutConfig } from '../layouts'

export interface FrameConfig {
  id: string
  name: string
  description: string
  icon: string
  previewColor: string
  /**
   * Fungsi untuk menggambar dekorasi overlay frame di atas foto
   * Menggunakan Canvas API resolusi penuh (crisp & vector sharp)
   */
  drawOverlay: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layout: LayoutConfig
  ) => void
}

export const PHOTO_FRAMES: FrameConfig[] = [
  {
    id: 'pixel-tamagotchi',
    name: 'Tamagotchi Pocket Pet',
    description: 'Konsol hewan peliharaan virtual 90-an lucu dengan tombol A-B-C dan pixel hearts',
    icon: '🐣',
    previewColor: '#f472b6',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Border pastel pink & rounded pixel egg shell
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 18

        // Outer pastel border
        ctx.strokeStyle = '#f472b6'
        ctx.lineWidth = Math.max(5, width * 0.006)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()

        // Inner dotted LCD pixel border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.roundRect(sx + 4, sy + 4, sw - 8, sh - 8, Math.max(4, r - 4))
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Top Tamagotchi Header: "♥ HAPPY: 100%  [▮▮▮]"
      const topH = height * 0.03
      ctx.fillStyle = '#1e1b4b'
      ctx.fillRect(0, 0, width, topH)
      ctx.fillStyle = '#f472b6'
      ctx.fillRect(0, topH - 2, width, 2)

      ctx.fillStyle = '#fda4af'
      ctx.font = `bold ${Math.max(10, width * 0.016)}px "Press Start 2P", monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('♥ LOVE: MAX', width * 0.04, topH / 2)

      ctx.fillStyle = '#a7f3d0'
      ctx.textAlign = 'right'
      ctx.fillText('BATT [▮▮▮]', width * 0.96, topH / 2)

      // Bottom 3 Tactile Tamagotchi Buttons: (A) FEED  (B) PLAY  (C) WASH
      const btnY = height * 0.985
      ctx.fillStyle = '#f472b6'
      ctx.font = `bold ${Math.max(9, width * 0.014)}px "Press Start 2P", monospace`
      ctx.textAlign = 'center'
      ctx.fillText('(A) FEED   (B) PLAY   (C) WASH', width / 2, btnY)

      ctx.restore()
    },
  },
  {
    id: 'pixel-kawaii-cafe',
    name: 'Kawaii 8-Bit Bakery',
    description: 'Kafe piksel manis bergaya Jepang dengan stroberi, boba & motif gingham pastel',
    icon: '🍰',
    previewColor: '#fb7185',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Cute pastel gingham pixel border
      const checkSize = Math.max(10, width * 0.02)
      const colors = ['#ffe4e6', '#fecdd3', '#fff1f2']
      
      // Top and bottom decorative borders
      for (let x = 0; x < width; x += checkSize) {
        ctx.fillStyle = colors[Math.floor(x / checkSize) % colors.length]
        ctx.fillRect(x, 0, checkSize, height * 0.012)
        ctx.fillRect(x, height - height * 0.012, checkSize, height * 0.012)
      }

      // Slot border manis
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height

        ctx.strokeStyle = '#fb7185'
        ctx.lineWidth = Math.max(4, width * 0.005)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, 14)
        ctx.stroke()
      })

      // Cute Japanese Title Banner: "★ かわいい CAFE MOMENTS ★"
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(251, 113, 133, 0.4)'
      ctx.shadowBlur = 8
      const banW = width * 0.65
      const banH = height * 0.026
      ctx.beginPath()
      ctx.roundRect(width / 2 - banW / 2, height * 0.015, banW, banH, 10)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#e11d48'
      ctx.font = `bold ${Math.max(10, width * 0.017)}px "Press Start 2P", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★ かわいい PIXEL CAFE ★', width / 2, height * 0.015 + banH / 2)

      ctx.restore()
    },
  },
  {
    id: 'pixel-arcade',
    name: '8-Bit Arcade Cabinet',
    description: 'Estetika mesin arkade retro dengan scanlines, skor tinggi, dan border neon pixel',
    icon: '👾',
    previewColor: '#00ff66',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Gambar 8-bit pixel border tajam di sekeliling slot foto
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const pSize = Math.max(4, width * 0.005)

        // Outer black pixel frame
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = pSize * 2
        ctx.strokeRect(sx, sy, sw, sh)

        // Neon Green pixel inner frame
        ctx.strokeStyle = '#00ff66'
        ctx.lineWidth = pSize
        ctx.strokeRect(sx, sy, sw, sh)

        // Corner 8-bit stepped brackets (Pixel corner decoration)
        ctx.fillStyle = '#00f0ff'
        const cLen = pSize * 3
        ;[
          { x: sx, y: sy },
          { x: sx + sw - cLen, y: sy },
          { x: sx, y: sy + sh - cLen },
          { x: sx + sw - cLen, y: sy + sh - cLen },
        ].forEach((pt) => {
          ctx.fillRect(pt.x, pt.y, cLen, pSize)
          ctx.fillRect(pt.x, pt.y, pSize, cLen)
        })
      })

      // Top Arcade Marquee
      const headerH = height * 0.03
      ctx.fillStyle = '#121424'
      ctx.fillRect(0, 0, width, headerH)
      ctx.fillStyle = '#00ff66'
      ctx.fillRect(0, headerH - 3, width, 3)

      ctx.fillStyle = '#00f0ff'
      ctx.font = `bold ${Math.max(12, width * 0.019)}px "Press Start 2P", monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('1P READY', width * 0.04, headerH / 2)

      ctx.fillStyle = '#ffe600'
      ctx.textAlign = 'right'
      ctx.fillText('HI-SCORE 99990', width * 0.96, headerH / 2)

      // Bottom "INSERT COIN" text
      ctx.fillStyle = '#ff007f'
      ctx.font = `bold ${Math.max(11, width * 0.016)}px "Press Start 2P", monospace`
      ctx.textAlign = 'center'
      ctx.fillText('★ INSERT COIN [02] ★', width / 2, height * 0.985)

      ctx.restore()
    },
  },
  {
    id: 'pixel-rpg',
    name: 'Retro RPG Quest',
    description: 'Petualangan game klasik dengan bar HP pixel hearts dan kotak dialog',
    icon: '⚔️',
    previewColor: '#00f0ff',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Slot border dengan warna biru cyan dan highlight putih pixel
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = Math.max(6, width * 0.007)
        ctx.strokeRect(sx, sy, sw, sh)

        ctx.strokeStyle = '#00f0ff'
        ctx.lineWidth = Math.max(3, width * 0.0035)
        ctx.strokeRect(sx, sy, sw, sh)
      })

      // Top RPG Stats Bar: "HP: ♥ ♥ ♥ ♥   LVL 99"
      const barH = height * 0.03
      ctx.fillStyle = '#090a12'
      ctx.fillRect(0, 0, width, barH)
      ctx.strokeStyle = '#ff0055'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, width, barH)

      ctx.fillStyle = '#ff0055'
      ctx.font = `bold ${Math.max(12, width * 0.018)}px "Press Start 2P", monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('HP: ♥ ♥ ♥ ♥', width * 0.04, barH / 2)

      ctx.fillStyle = '#ffe600'
      ctx.textAlign = 'right'
      ctx.fillText('LVL 99', width * 0.96, barH / 2)

      ctx.restore()
    },
  },
  {
    id: 'lego-superhero',
    name: 'LEGO Avengers Brick',
    description: 'Balok LEGO warna-warni superhero dengan stud timbul & banner pahlawan',
    icon: '🧱',
    previewColor: '#e62429',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Gambar stud balok LEGO di sekeliling border luar
      const studSize = Math.max(6, width * 0.01)
      const brickColors = ['#e62429', '#f59e0b', '#0066ff', '#10b981', '#ffffff']

      // Studs horizontal atas & bawah
      const topCount = Math.floor(width / (studSize * 3))
      for (let i = 0; i < topCount; i++) {
        const x = (i + 0.5) * (width / topCount)
        const col = brickColors[i % brickColors.length]
        // Stud atas
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x, height * 0.015, studSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Stud bawah
        ctx.beginPath()
        ctx.arc(x, height * 0.985, studSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // Border balok tebal di setiap slot foto dengan 4 stud sudut
      layout.slots.forEach((slot, idx) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 18

        const slotColor = brickColors[idx % (brickColors.length - 1)]

        // 3D Brick border
        ctx.strokeStyle = slotColor
        ctx.lineWidth = Math.max(5, width * 0.005)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()

        // 4 corner studs
        ctx.fillStyle = '#f59e0b'
        const cOff = 12
        ;[
          { x: sx + cOff, y: sy + cOff },
          { x: sx + sw - cOff, y: sy + cOff },
          { x: sx + cOff, y: sy + sh - cOff },
          { x: sx + sw - cOff, y: sy + sh - cOff },
        ].forEach((pt) => {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, studSize * 0.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(0,0,0,0.4)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        })
      })

      // Top Marvel LEGO Badge
      const badgeW = width * 0.42
      const badgeH = height * 0.03
      const bx = width / 2 - badgeW / 2
      const by = height * 0.008

      ctx.fillStyle = '#e62429'
      ctx.beginPath()
      ctx.roundRect(bx, by, badgeW, badgeH, 8)
      ctx.fill()
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = `900 ${Math.max(14, width * 0.022)}px Plus Jakarta Sans, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⚡ MARVEL BRICK HEROES ⚡', width / 2, by + badgeH / 2)

      ctx.restore()
    },
  },
  {
    id: 'lego-comic',
    name: 'Comic Hero Blast',
    description: 'Aksen komik superhero penuh aksi, ledakan BAM! dan pola pop art',
    icon: '💥',
    previewColor: '#f59e0b',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Border komik superhero tebal dengan strip kuning & merah
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 16

        // Outer black comic line
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = Math.max(6, width * 0.007)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()

        // Inner yellow action line
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = Math.max(3, width * 0.0035)
        ctx.beginPath()
        ctx.roundRect(sx + 3, sy + 3, sw - 6, sh - 6, Math.max(4, r - 3))
        ctx.stroke()
      })

      // Mini BAM badge di pojok kanan bawah
      const bamX = width * 0.88
      const bamY = height * 0.94
      const bSize = Math.max(22, width * 0.035)

      ctx.save()
      ctx.translate(bamX, bamY)
      ctx.rotate(-0.15)
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        ctx.lineTo(Math.cos(a) * bSize, Math.sin(a) * bSize)
        ctx.lineTo(Math.cos(a + Math.PI / 8) * (bSize * 0.5), Math.sin(a + Math.PI / 8) * (bSize * 0.5))
      }
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#fef08a'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = `900 ${Math.max(10, width * 0.015)}px Plus Jakarta Sans, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('POW!', 0, 0)
      ctx.restore()

      ctx.restore()
    },
  },
  {
    id: 'clean',
    name: 'Polos Klasik',
    description: 'Garis border minimalis yang elegan dan rapi',
    icon: '✨',
    previewColor: '#6366f1',
    drawOverlay: (ctx, width, height, layout) => {
      // Gambar border halus di sekeliling setiap slot foto
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.lineWidth = Math.max(3, width * 0.003)

      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 16

        // Rounded rect outline
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()
      })

      // Garis pemisah estetik di bawah
      const textSlot = layout.textSlot
      const ty = ((textSlot.y - 1) / 100) * height
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width * 0.2, ty)
      ctx.lineTo(width * 0.8, ty)
      ctx.stroke()

      ctx.restore()
    },
  },
  {
    id: 'birthday',
    name: 'Ulang Tahun',
    description: 'Konfeti meriah, bintang emas, dan balon pesta',
    icon: '🎉',
    previewColor: '#f59e0b',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Gambar konfeti warna-warni di sekeliling border
      const confettiColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#fb7185']
      const count = 45

      // Pseudo random generator stabil berbasis dimensi
      for (let i = 0; i < count; i++) {
        const seed = (i * 9301 + 49297) % 233280
        const randX = (seed / 233280) * width
        const randY = (((seed * 7) % 233280) / 233280) * height
        const size = Math.max(8, width * 0.012)
        const angle = (seed % 360) * (Math.PI / 180)
        const color = confettiColors[i % confettiColors.length]

        ctx.fillStyle = color
        ctx.save()
        ctx.translate(randX, randY)
        ctx.rotate(angle)

        if (i % 3 === 0) {
          // Lingkaran kecil
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2)
          ctx.fill()
        } else if (i % 3 === 1) {
          // Bintang empat sudut
          ctx.beginPath()
          for (let p = 0; p < 4; p++) {
            ctx.lineTo(Math.cos((p * Math.PI) / 2) * size, Math.sin((p * Math.PI) / 2) * size)
            ctx.lineTo(
              Math.cos((p * Math.PI) / 2 + Math.PI / 4) * (size * 0.35),
              Math.sin((p * Math.PI) / 2 + Math.PI / 4) * (size * 0.35)
            )
          }
          ctx.closePath()
          ctx.fill()
        } else {
          // Persegi panjang konfeti
          ctx.fillRect(-size, -size / 2, size * 2, size)
        }
        ctx.restore()
      }

      // Border ornamen emas tipis di setiap slot
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 16

        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = Math.max(4, width * 0.004)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()
      })

      // Badge/Banner "PARTY TIME" di pojok atas
      ctx.fillStyle = '#f43f5e'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 10
      const bannerW = width * 0.35
      const bannerH = height * 0.025
      ctx.beginPath()
      ctx.roundRect(width / 2 - bannerW / 2, height * 0.01, bannerW, bannerH, 12)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.max(16, width * 0.024)}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✨ CELEBRATE ✨', width / 2, height * 0.01 + bannerH / 2)

      ctx.restore()
    },
  },
  {
    id: 'minimal-film',
    name: 'Minimalis Film',
    description: 'Estetika analog 35mm film strip & timestamp vintage',
    icon: '🎞️',
    previewColor: '#10b981',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Film sprockets / lubang klise film di sisi kiri dan kanan
      const sprocketW = width * 0.025
      const sprocketH = height * 0.015
      const sprocketSpacing = height * 0.035
      const numSprockets = Math.floor(height / sprocketSpacing)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      for (let i = 1; i < numSprockets; i++) {
        const y = i * sprocketSpacing
        // Lubang kiri
        ctx.beginPath()
        ctx.roundRect(width * 0.018, y, sprocketW, sprocketH, 4)
        ctx.fill()

        // Lubang kanan
        ctx.beginPath()
        ctx.roundRect(width - width * 0.018 - sprocketW, y, sprocketW, sprocketH, 4)
        ctx.fill()
      }

      // Slot border analog
      layout.slots.forEach((slot, idx) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.strokeRect(sx, sy, sw, sh)

        // Film frame number kecil
        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)' // Amber film stamp
        ctx.font = `bold ${Math.max(12, width * 0.016)}px Space Grotesk, monospace`
        ctx.textAlign = 'left'
        ctx.fillText(`• ${idx + 1}A • ISO 400`, sx + 8, sy - 8)
      })

      ctx.restore()
    },
  },
  {
    id: 'romantic',
    name: 'Romantic Love',
    description: 'Hati manis bernuansa merah muda pastel dan kilau cinta',
    icon: '💖',
    previewColor: '#ec4899',
    drawOverlay: (ctx, width, height, layout) => {
      ctx.save()

      // Gambar hati kecil dekoratif
      const drawHeart = (cx: number, cy: number, size: number, color: string) => {
        ctx.save()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(cx, cy + size * 0.3)
        ctx.bezierCurveTo(cx - size * 0.7, cy - size * 0.5, cx - size, cy + size * 0.3, cx, cy + size)
        ctx.bezierCurveTo(cx + size, cy + size * 0.3, cx + size * 0.7, cy - size * 0.5, cx, cy + size * 0.3)
        ctx.fill()
        ctx.restore()
      }

      const heartPositions = [
        { x: width * 0.08, y: height * 0.025, size: width * 0.02, color: '#f43f5e' },
        { x: width * 0.92, y: height * 0.025, size: width * 0.024, color: '#fb7185' },
        { x: width * 0.05, y: height * 0.48, size: width * 0.018, color: '#fda4af' },
        { x: width * 0.95, y: height * 0.52, size: width * 0.022, color: '#f43f5e' },
        { x: width * 0.15, y: height * 0.88, size: width * 0.018, color: '#fda4af' },
        { x: width * 0.85, y: height * 0.88, size: width * 0.022, color: '#fb7185' },
      ]

      heartPositions.forEach((h) => drawHeart(h.x, h.y, h.size, h.color))

      // Border merah muda lembut
      layout.slots.forEach((slot) => {
        const sx = (slot.x / 100) * width
        const sy = (slot.y / 100) * height
        const sw = (slot.width / 100) * width
        const sh = (slot.height / 100) * height
        const r = slot.borderRadius || 20

        ctx.strokeStyle = '#fda4af'
        ctx.lineWidth = Math.max(4, width * 0.0035)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, r)
        ctx.stroke()
      })

      ctx.restore()
    },
  },
]

export function getFrameById(id: string): FrameConfig {
  return PHOTO_FRAMES.find((f) => f.id === id) || PHOTO_FRAMES[0]
}
