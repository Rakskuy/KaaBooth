/**
 * store/sessionStore.ts
 * Zustand store: menyimpan semua state sesi foto.
 * Diakses oleh usePhotoSession, CameraPage, ReviewScreen, dll.
 */

import { create } from 'zustand'
import type { AspectRatio } from '../components/CameraPreview'

export type PhotoCount = 1 | 3 | 4
export type CountdownSecs = 3 | 5 | 10
export type SessionPhase =
  | 'settings'
  | 'countdown'
  | 'capturing'
  | 'pausing'
  | 'review'
  | 'done'

interface SessionStore {
  /* ── Pengaturan sesi ──────────────────────────── */
  photoCount: PhotoCount
  countdownSecs: CountdownSecs
  aspectRatio: AspectRatio
  isSoundEnabled: boolean

  /* ── State sesi ───────────────────────────────── */
  phase: SessionPhase
  currentIndex: number
  retakeIndex: number | null  // index foto yg sedang di-retake
  photos: (string | null)[]   // dataURL JPEG | null = slot kosong

  /* ── Actions ──────────────────────────────────── */
  setPhotoCount: (n: PhotoCount) => void
  setCountdownSecs: (n: CountdownSecs) => void
  setAspectRatio: (r: AspectRatio) => void
  toggleSound: () => void

  setPhase: (p: SessionPhase) => void
  setCurrentIndex: (i: number) => void
  setRetakeIndex: (i: number | null) => void
  setPhoto: (index: number, dataUrl: string) => void

  startSession: () => void
  startRetake: (index: number) => void
  retakeAll: () => void
  resetSession: () => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  /* defaults */
  photoCount: 4,
  countdownSecs: 3,
  aspectRatio: '3:4',
  isSoundEnabled: true,

  phase: 'settings',
  currentIndex: 0,
  retakeIndex: null,
  photos: Array<null>(4).fill(null),

  /* settings */
  setPhotoCount: (n) =>
    set({ photoCount: n, photos: Array<null>(n).fill(null) }),
  setCountdownSecs: (n) => set({ countdownSecs: n }),
  setAspectRatio: (r) => set({ aspectRatio: r }),
  toggleSound: () => set((s) => ({ isSoundEnabled: !s.isSoundEnabled })),

  /* phase & index */
  setPhase: (p) => set({ phase: p }),
  setCurrentIndex: (i) => set({ currentIndex: i }),
  setRetakeIndex: (i) => set({ retakeIndex: i }),

  /* photo slot */
  setPhoto: (index, dataUrl) =>
    set((s) => {
      const photos = [...s.photos]
      photos[index] = dataUrl
      return { photos }
    }),

  /* session transitions */
  startSession: () => {
    const { photoCount } = get()
    set({
      phase: 'countdown',
      currentIndex: 0,
      retakeIndex: null,
      photos: Array<null>(photoCount).fill(null),
    })
  },

  startRetake: (index) =>
    set({ phase: 'countdown', currentIndex: index, retakeIndex: index }),

  retakeAll: () => {
    const { photoCount } = get()
    set({
      phase: 'countdown',
      currentIndex: 0,
      retakeIndex: null,
      photos: Array<null>(photoCount).fill(null),
    })
  },

  resetSession: () => {
    const { photoCount } = get()
    set({
      phase: 'settings',
      currentIndex: 0,
      retakeIndex: null,
      photos: Array<null>(photoCount).fill(null),
    })
  },
}))
