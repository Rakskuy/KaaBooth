/**
 * lib/shutterSound.ts
 * Mensintesis suara shutter kamera menggunakan Web Audio API.
 * Tidak memerlukan file audio eksternal.
 * Gagal secara senyap jika browser tidak mendukung.
 */

export function playShutter(): void {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return

    const ctx = new AC()

    // ── Bagian 1: Klik mekanik (burst noise pendek) ──────
    const clickDuration = 0.04 // 40ms
    const clickSamples = Math.floor(ctx.sampleRate * clickDuration)
    const clickBuf = ctx.createBuffer(1, clickSamples, ctx.sampleRate)
    const clickData = clickBuf.getChannelData(0)
    for (let i = 0; i < clickSamples; i++) {
      // Exponential decay noise
      clickData[i] =
        (Math.random() * 2 - 1) *
        Math.exp(-i / (ctx.sampleRate * 0.008))
    }
    const clickSrc = ctx.createBufferSource()
    clickSrc.buffer = clickBuf

    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.45

    clickSrc.connect(clickGain)
    clickGain.connect(ctx.destination)
    clickSrc.start(ctx.currentTime)

    // ── Bagian 2: Nada mechanical clack ─────────────────
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)

    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.08, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)

    // Tutup context setelah suara selesai
    osc.onended = () => {
      void ctx.close()
    }
  } catch {
    // Suara bersifat opsional — gagal senyap
  }
}
