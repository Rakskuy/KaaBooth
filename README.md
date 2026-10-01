# 📸 SnapBooth – Photobooth Online Gratis & Kiosk System

Aplikasi web photobooth modern, cepat, dan interaktif yang berjalan 100% di browser tanpa perlu menginstal aplikasi. Dilengkapi dengan studio editor desain strip foto, filter visual native, stiker & emoji, animasi GIF/boomerang, integrasi cloud Supabase (QR code share), galeri event massal (ZIP), dan **Mode Kiosk Layar Penuh Otomatis untuk Tablet**.

---

## 🌟 Fitur Utama

- **Kamera & Countdown**: Auto center-crop ke rasio 3:4, 4:3, 1:1, efek flash capture, audio shutter sintetis via Web Audio API, serta deteksi browser in-app.
- **Studio Editor & Komposisi**:
  - Pilihan layout (Single, 3-Foto Strip, 4-Foto Strip, Grid 2x2).
  - 8+ Desain Frame elegan (Clean, Retro Film, Cute Pastel, Wedding Elegant, dsb.).
  - 7 Filter foto siap pakai (Normal, B&W, Sepia, Vintage, Cerah, Film Grain, Dingin) + Slider penyesuaian (Brightness, Contrast, Saturation, Natural Skin Smoothing).
  - 20+ Stiker & Emoji interaktif (drag, pinch/scale, rotate, delete).
  - Generator Animasi GIF & Boomerang HD.
  - Opsi Watermark kustom per event.
- **Berbagi & Unduh**:
  - Web Share API native (WhatsApp, IG Story, direct share).
  - Panduan simpan galeri foto khusus iOS Safari (Long-press save).
- **Backend Supabase & QR Code Cloud**:
  - QR Code otomatis untuk tamu mengunduh hasil foto dari HP mereka via `/p/:id`.
  - Row Level Security (RLS) ketat pada tabel `events` dan `photos`.
- **Dashboard Admin Event (`/admin`)**:
  - Akses langsung tanpa login/registrasi untuk pengelolaan event yang cepat & efisien.
  - Manajemen Event CRUD (Nama, Slug, Tanggal, Logo, Frame PNG kustom, PIN Kiosk, Kode Akses privat, Masa Retensi).
  - Galeri Event dengan tombol unduh satuan, hapus, dan **Unduh Semua sebagai ZIP** (`jszip`).
  - Metrik & Histogram Aktivitas Pengambilan Foto per Jam.
- **Mode Kiosk Tablet (`/e/:slug?kiosk=1`)**:
  - Layar penuh bebas navigasi dengan **Screen Wake Lock API** (layar tidak mati/sleep selama acara).
  - Alur otomatis: Layar Sambut $\rightarrow$ Kamera & Countdown $\rightarrow$ Komposisi & Auto Upload QR $\rightarrow$ Auto-Reset 30 Detik $\rightarrow$ Layar Sambut.
  - Kunci keluar Kiosk dengan PIN Admin.
- **PWA & Aksesibilitas (Tahap 8)**:
  - Dukungan Progressive Web App (PWA) dengan Service Worker cache & tombol "Add to Home Screen".
  - Dukungan Bahasa Indonesia & Inggris (i18n) dengan deteksi bahasa otomatis.
  - Mode Gelap (Dark Mode) dan Mode Terang (Light Mode).
  - Target sentuh tablet $\ge 44\text{px}$, navigasi keyboard, dan penanganan edge cases (tab background recovery, koneksi putus-nyambung auto-retry).

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js**: v18.0.0 atau lebih baru
- **npm** atau **pnpm** / **yarn**

### 2. Kloning & Pasang Dependensi
```bash
# Clone repository
git clone <url-repo-anda>
cd "Membuat web photooboth"

# Install dependensi
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi Supabase Anda di file `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser ke `http://localhost:5173`.

---

## 🗄️ Konfigurasi Database Supabase

Jalankan script SQL di [supabase/schema.sql](file:///c:/Users/kabyu/Documents/BELAJAR%20DASAR%20CODING%20BUAT%20MASA%20DEPAN%20AKU/Membuat%20web%20photooboth/supabase/schema.sql) pada menu **SQL Editor** di Dashboard Supabase:

1. Buat Bucket Storage bernama `photos` dengan akses publik aktif.
2. Skema membuat tabel `events` dan `photos`.
3. RLS Policies:
   - **events**: Publik dapat membaca event aktif (`is_active = true`), sedangkan operasi INSERT, UPDATE, DELETE hanya dapat dilakukan oleh Admin yang terautentikasi (`auth.role() = 'authenticated'`).
   - **photos**: Publik dapat membaca foto via ID (`/p/:id`), mengunggah foto photobooth (INSERT), sedangkan penghapusan (DELETE) dibatasi hanya untuk Admin.

---

## 🌐 Panduan Deploy ke Vercel

1. **Push ke GitHub**: Pastikan repository Anda telah di-push ke GitHub / GitLab.
2. **Import ke Vercel**:
   - Buka [vercel.com](https://vercel.com) $\rightarrow$ Klik **Add New** $\rightarrow$ **Project**.
   - Pilih repository project ini.
   - Framework Preset: **Vite**.
3. **Tambahkan Environment Variables di Vercel**:
   - `VITE_SUPABASE_URL`: URL project Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Anon Public Key Supabase Anda.
4. **Deploy**: Klik **Deploy**.
   * File [vercel.json](file:///c:/Users/kabyu/Documents/BELAJAR%20DASAR%20CODING%20BUAT%20MASA%20DEPAN%20AKU/Membuat%20web%20photooboth/vercel.json) telah disediakan untuk menangani SPA rewrites (`/e/:slug`, `/p/:id`, `/admin`) serta caching Service Worker.

---

## 🎨 Panduan Menambah Frame & Layout Baru

### Menambah Frame Baru:
1. Buka [src/assets/frames.ts](file:///c:/Users/kabyu/Documents/BELAJAR%20DASAR%20CODING%20BUAT%20MASA%20DEPAN%20AKU/Membuat%20web%20photooboth/src/assets/frames.ts).
2. Tambahkan objek frame baru ke array `PHOTO_FRAMES`:
```ts
{
  id: 'nama-frame-kustom',
  name: 'Judul Frame',
  icon: '✨',
  description: 'Deskripsi frame',
  drawOverlay: (ctx, width, height, layout) => {
    // Gambar ornamen kanvas kustom di sini
  }
}
```

### Menambah Layout Baru:
1. Buka [src/assets/layouts.ts](file:///c:/Users/kabyu/Documents/BELAJAR%20DASAR%20CODING%20BUAT%20MASA%20DEPAN%20AKU/Membuat%20web%20photooboth/src/assets/layouts.ts).
2. Tambahkan konfigurasi layout baru dengan posisi koordinat slot foto dalam persentase (0–100%).

---

## 📱 Panduan Mode Kiosk untuk Acara / Stand Tablet

1. Buka dashboard admin di `/admin` lalu buat event baru.
2. Atur branding (Judul, Logo, Warna Latar, Watermark, dan PIN Keluar Kiosk).
3. Salin link Kiosk: `https://domain-anda.com/e/[slug-event]?kiosk=1`.
4. Buka link tersebut di browser tablet (iPad Safari atau Android Chrome).
5. Pasang ke Home Screen (PWA) untuk pengalaman layar penuh murni tanpa bilah URL browser.
6. Photobooth akan berjalan otomatis berulang kali dan mereset diri secara bersih setelah setiap tamu selesai berfoto.

---

## 📄 Lisensi
Dibuat dengan ❤️ untuk photobooth interaktif modern.
