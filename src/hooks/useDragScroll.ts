import { useRef, useState, useEffect, useCallback } from 'react'

export interface UseDragScrollOptions {
  /** Aktifkan konversi mouse wheel vertikal ke scroll horizontal (default: true) */
  enableWheel?: boolean
  /** Jarak minimal drag dalam pixel sebelum dianggap sebagai aksi geser (default: 5) */
  dragThreshold?: number
  /** Aktifkan efek momentum / inersia saat mouse dilepas cepat (default: true) */
  enableInertia?: boolean
}

export function useDragScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseDragScrollOptions = {}
) {
  const {
    enableWheel = true,
    dragThreshold = 5,
    enableInertia = true,
  } = options

  const ref = useRef<T | null>(null)
  const isPointerDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftStartRef = useRef(0)
  const hasDraggedRef = useRef(false)

  // Velocity tracking untuk efek inersia halus
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const animFrameIdRef = useRef<number | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Periksa apakah konten bisa di-scroll ke kiri atau ke kanan
  const updateScrollState = useCallback(() => {
    const el = ref.current
    if (!el) return
    const tolerance = 2
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > tolerance)
    setCanScrollRight(maxScroll > tolerance && el.scrollLeft < maxScroll - tolerance)
  }, [])

  // Hentikan inersia animation frame jika sedang berjalan
  const stopInertia = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
  }, [])

  // Event listener scroll & resize observer
  useEffect(() => {
    const el = ref.current
    if (!el) return

    updateScrollState()

    const onScroll = () => {
      updateScrollState()
    }

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState()
    })

    resizeObserver.observe(el)
    el.addEventListener('scroll', onScroll, { passive: true })

    // Mouse wheel: jika scroll vertikal di atas container horizontal, scroll kontennya
    const handleWheel = (e: WheelEvent) => {
      if (!enableWheel) return
      // Jika scroll lebih dominan vertikal dan container bisa di-scroll horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault()
        stopInertia()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      stopInertia()
      resizeObserver.disconnect()
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', handleWheel)
    }
  }, [updateScrollState, enableWheel, stopInertia])

  // Handler saat mouse ditekan di container
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Hanya tanggapi klik kiri (button 0)
      if (e.button !== 0) return
      const el = ref.current
      if (!el) return

      stopInertia()
      isPointerDownRef.current = true
      hasDraggedRef.current = false
      startXRef.current = e.pageX
      scrollLeftStartRef.current = el.scrollLeft
      lastXRef.current = e.pageX
      lastTimeRef.current = performance.now()
      velocityRef.current = 0
    },
    [stopInertia]
  )

  // Event mousemove dan mouseup global di window agar drag tetap mulus walau kursor keluar container
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerDownRef.current) return
      const el = ref.current
      if (!el) return

      const deltaX = e.pageX - startXRef.current

      // Jika pergerakan melebihi threshold, anggap sebagai drag
      if (!hasDraggedRef.current && Math.abs(deltaX) > dragThreshold) {
        hasDraggedRef.current = true
        setIsDragging(true)
      }

      if (hasDraggedRef.current) {
        e.preventDefault()
        el.scrollLeft = scrollLeftStartRef.current - deltaX

        // Hitung kecepatan geser (velocity)
        const now = performance.now()
        const dt = now - lastTimeRef.current
        if (dt > 0) {
          const instantVelocity = (e.pageX - lastXRef.current) / dt
          velocityRef.current = instantVelocity * 0.7 + velocityRef.current * 0.3
        }
        lastXRef.current = e.pageX
        lastTimeRef.current = now
      }
    }

    const handleMouseUp = () => {
      if (!isPointerDownRef.current) return
      isPointerDownRef.current = false

      if (hasDraggedRef.current) {
        // Beri jeda sangat kecil agar onClickCapture pada tombol anak sempat mencegah klik yang tidak sengaja
        setTimeout(() => {
          hasDraggedRef.current = false
          setIsDragging(false)
        }, 50)

        // Terapkan momentum / inersia jika dilepas dengan kecepatan
        if (enableInertia && Math.abs(velocityRef.current) > 0.15) {
          const el = ref.current
          if (!el) return

          let currentVelocity = velocityRef.current * 16 // skala ke per frame ~16ms
          const stepInertia = () => {
            if (!el || Math.abs(currentVelocity) < 0.3) {
              animFrameIdRef.current = null
              return
            }
            el.scrollLeft -= currentVelocity
            currentVelocity *= 0.92 // gesekan / deselerasi
            animFrameIdRef.current = requestAnimationFrame(stepInertia)
          }
          animFrameIdRef.current = requestAnimationFrame(stepInertia)
        }
      } else {
        setIsDragging(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragThreshold, enableInertia])

  // Cegah event click pada elemen anak (seperti tab button) jika pengguna baru saja melakukan drag
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  // Fungsi navigasi tombol panah kiri / kanan
  const scrollByAmount = useCallback(
    (amount: number) => {
      const el = ref.current
      if (!el) return
      stopInertia()
      el.scrollBy({
        left: amount,
        behavior: 'smooth',
      })
    },
    [stopInertia]
  )

  // Fungsi untuk menggulir elemen target (misal tab aktif) ke posisi tengah
  const scrollToCenter = useCallback((targetEl: HTMLElement | null) => {
    const el = ref.current
    if (!el || !targetEl) return

    const containerRect = el.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()

    const targetCenter = targetRect.left + targetRect.width / 2
    const containerCenter = containerRect.left + containerRect.width / 2
    const offset = targetCenter - containerCenter

    el.scrollBy({
      left: offset,
      behavior: 'smooth',
    })
  }, [])

  return {
    ref,
    isDragging,
    canScrollLeft,
    canScrollRight,
    onMouseDown,
    onClickCapture,
    scrollByAmount,
    scrollToCenter,
    updateScrollState,
  }
}
