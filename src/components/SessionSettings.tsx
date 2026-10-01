/**
 * components/SessionSettings.tsx
 * Panel pengaturan sebelum memulai sesi:
 * - Jumlah foto (1 / 3 / 4)
 * - Timer countdown (3 / 5 / 10 detik)
 * - Rasio aspek foto
 * - Toggle suara shutter
 * - Preview kamera kecil (agar user bisa frame diri)
 */

import { CameraPreview } from './CameraPreview'
import type { FacingMode } from '../hooks/useCamera'
import type { PhotoCount, CountdownSecs } from '../store/sessionStore'
import { useSessionStore } from '../store/sessionStore'
import { useI18n } from '../lib/i18n'
import type { AspectRatio } from './CameraPreview'

interface SessionSettingsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  facingMode: FacingMode
  canSwitch: boolean
  onSwitchCamera: () => void
  onBack: () => void
  stream?: MediaStream | null
}

const PHOTO_COUNTS: PhotoCount[] = [1, 3, 4]
const COUNTDOWN_OPTS: CountdownSecs[] = [3, 5, 10]
const RATIOS: AspectRatio[] = ['3:4', '4:3', '1:1']

function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel,
  idPrefix,
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
  formatLabel?: (v: T) => string
  idPrefix: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
        {label}
      </span>
      <div
        className="flex gap-2"
        role="group"
        aria-label={label}
      >
        {options.map((opt) => (
          <button
            key={String(opt)}
            id={`${idPrefix}-${String(opt)}`}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
            style={{
              background:
                value === opt
                  ? 'linear-gradient(135deg, var(--c-primary), var(--c-primary2))'
                  : 'var(--c-surface2)',
              color: value === opt ? 'white' : 'var(--c-muted)',
              border: value === opt ? 'none' : '1px solid var(--c-border)',
            }}
          >
            {formatLabel ? formatLabel(opt) : String(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SessionSettings({
  videoRef,
  facingMode,
  canSwitch,
  onSwitchCamera,
  onBack,
  stream,
}: SessionSettingsProps) {
  const { t } = useI18n()
  const {
    photoCount, setPhotoCount,
    countdownSecs, setCountdownSecs,
    aspectRatio, setAspectRatio,
    isSoundEnabled, toggleSound,
    startSession,
  } = useSessionStore()

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <button
          id="btn-settings-back"
          type="button"
          onClick={onBack}
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--c-muted)' }}
        >
          ← {t('nav_back')}
        </button>
        <h1 className="text-base font-bold text-white">{t('session_title')}</h1>
        {/* Switch camera */}
        {canSwitch && (
          <button
            id="btn-settings-switch"
            type="button"
            onClick={onSwitchCamera}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--c-muted)' }}
            aria-label={t('camera_switch')}
          >
            🔄
          </button>
        )}
      </div>

      {/* Mini camera preview */}
      <div className="w-full flex items-center justify-center min-h-[220px]">
        <CameraPreview
          videoRef={videoRef}
          facingMode={facingMode}
          aspectRatio={aspectRatio}
          stream={stream}
          className="w-auto h-[35dvh] max-h-[300px] max-w-full shadow-lg"
        />
      </div>

      {/* Settings panel */}
      <div
        className="glass-card w-full p-5 flex flex-col gap-5"
      >
        <OptionGroup
          label={t('session_photo_count')}
          options={PHOTO_COUNTS}
          value={photoCount}
          onChange={setPhotoCount}
          idPrefix="opt-count"
          formatLabel={(n) => `${n} ${t('session_photo_unit')}`}
        />
        <OptionGroup
          label={t('session_countdown_timer')}
          options={COUNTDOWN_OPTS}
          value={countdownSecs}
          onChange={setCountdownSecs}
          idPrefix="opt-timer"
          formatLabel={(n) => `${n}s`}
        />
        <OptionGroup
          label={t('session_aspect')}
          options={RATIOS}
          value={aspectRatio}
          onChange={setAspectRatio}
          idPrefix="opt-ratio"
        />

        {/* Sound toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
            {t('session_sound')}
          </span>
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={toggleSound}
            aria-pressed={isSoundEnabled}
            className="relative w-12 h-6 rounded-full transition-all duration-200"
            style={{
              background: isSoundEnabled
                ? 'linear-gradient(135deg, var(--c-primary), var(--c-primary2))'
                : 'var(--c-surface2)',
              border: '1px solid var(--c-border)',
            }}
            aria-label={isSoundEnabled ? t('session_sound_on') : t('session_sound_off')}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
              style={{ left: isSoundEnabled ? '26px' : '2px' }}
            />
          </button>
        </div>
      </div>

      {/* Start button */}
      <button
        id="btn-start-session"
        type="button"
        onClick={startSession}
        className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary2) 100%)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        {t('session_start_btn')}
      </button>
    </div>
  )
}

