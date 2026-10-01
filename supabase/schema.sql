-- ==============================================================================
-- SNAPBOOTH PHOTOBOOTH - SUPABASE DATABASE SCHEMA & RLS POLICIES (TAHAP 7)
-- ==============================================================================

-- 1. TABEL: events
-- Menyimpan konfigurasi khusus event/acara, branding, layout, dan mode kiosk.
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    pin_kiosk TEXT DEFAULT '1234',
    kode_akses TEXT DEFAULT NULL,
    konfigurasi_frame JSONB DEFAULT '{
        "frameId": "clean",
        "backgroundColor": "#121218",
        "customFrameUrl": null,
        "logoUrl": null,
        "title": "SnapBooth Moments",
        "fontFamily": "Outfit",
        "textColor": "#ffffff",
        "allowedLayouts": ["single", "vertical-3", "vertical-4", "grid-2x2"],
        "defaultPhotoCount": 4,
        "defaultCountdown": 3,
        "showDate": true
    }'::jsonb,
    retensi_hari INTEGER DEFAULT 7,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dibuat_pada TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);

-- 2. TABEL: photos
-- Menyimpan metadata foto dan GIF yang diunggah pengguna photobooth.
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    jenis TEXT CHECK (jenis IN ('foto', 'gif')) DEFAULT 'foto',
    file_size_bytes BIGINT,
    dibuat_pada TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_event_id ON public.photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_dibuat_pada ON public.photos(dibuat_pada);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS pada kedua tabel
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- ── Policies untuk Tabel 'events' ──────────────────────────
-- Publik (anon & auth) diizinkan membaca event aktif berdasarkan slug untuk photobooth.
CREATE POLICY "Public read active events"
    ON public.events
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR auth.role() = 'authenticated');

-- Admin yang terotentikasi (authenticated) memiliki akses penuh CRUD event
CREATE POLICY "Admin full access on events"
    ON public.events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ── Policies untuk Tabel 'photos' ──────────────────────────
-- Publik (anon) diizinkan mengunggah/insert catatan foto baru.
CREATE POLICY "Public insert photos"
    ON public.photos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Publik (anon) diizinkan membaca foto spesifik berdasarkan UUID (untuk /p/:id).
CREATE POLICY "Public read specific photo by id"
    ON public.photos
    FOR SELECT
    TO anon
    USING (true);

-- Admin (authenticated) diizinkan me-listing seluruh foto dan menghapus foto untuk galeri event.
CREATE POLICY "Admin full access on photos"
    ON public.photos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service role full access on photos"
    ON public.photos
    FOR ALL
    TO service_role
    USING (true);

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- Bucket 'photos' untuk penyimpanan file foto, GIF, logo event, dan custom frame PNG.
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'photos',
--     'photos',
--     true,
--     8388608, -- 8 MB
--     ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']
-- ) ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Publik diizinkan membaca file di bucket 'photos'
-- CREATE POLICY "Public read photos storage"
--     ON storage.objects FOR SELECT
--     TO anon, authenticated
--     USING (bucket_id = 'photos');

-- Policy Storage: Publik & Admin diizinkan mengunggah file ke bucket 'photos' (maks 8MB)
-- CREATE POLICY "Public upload photos storage"
--     ON storage.objects FOR INSERT
--     TO anon, authenticated
--     WITH CHECK (bucket_id = 'photos');

-- Policy Storage: Admin terotentikasi diizinkan menghapus file di storage
-- CREATE POLICY "Admin delete photos storage"
--     ON storage.objects FOR DELETE
--     TO authenticated
--     USING (bucket_id = 'photos');

-- ==============================================================================
-- KEBIJAKAN RETENSI OTOMATIS (AUTO-RETENTION CLEANUP)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT p.id, p.storage_path
        FROM public.photos p
        LEFT JOIN public.events e ON p.event_id = e.id
        WHERE p.dibuat_pada < NOW() - (COALESCE(e.retensi_hari, 7) || ' days')::INTERVAL
    LOOP
        DELETE FROM public.photos WHERE id = rec.id;
    END LOOP;
END;
$$;
