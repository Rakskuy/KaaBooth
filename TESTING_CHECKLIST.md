# 📋 SnapBooth – Daftar Checklist Pengujian Manual (QA Checklist)

Gunakan checklist ini untuk menguji fungsionalitas photobooth di berbagai perangkat nyata sebelum rilis produksi.

---

## 📱 1. Chrome di Smartphone Android

- [ ] **Izin Kamera**: Dialog izin browser muncul saat pertama kali menekan tombol "Mulai Foto".
- [ ] **Ganti Kamera**: Tombol switch kamera (Depan $\leftrightarrow$ Belakang) berfungsi mulus.
- [ ] **Flash & Suara Shutter**: Efek flash putih dan suara shutter mekanik berbunyi saat foto diambil.
- [ ] **Filter & Smoothing**: Menggeser slider skin smoothing dan mengganti filter foto (B&W, Sepia, Vintage, Film Grain) merespons dengan cepat.
- [ ] **Stiker & Gestur Sentuh**:
  - [ ] Stiker dapat ditambah ke kanvas.
  - [ ] Stiker dapat digeser dengan 1 jari.
  - [ ] Stiker dapat diubah ukuran (pinch) dan diputar dengan 2 jari.
- [ ] **Web Share API**: Tombol "Bagikan Foto" membuka lembar bagikan native Android (bisa dikirim ke WhatsApp, Instagram Story, dsb.).
- [ ] **PWA / Add to Home Screen**: Muncul banner install PWA atau bisa di-install lewat menu browser.

---

## 🍏 2. Safari di iPhone / iPad (iOS)

- [ ] **Autoplay Stream Kamera**: Video kamera berjalan langsung tanpa macet (properti `playsInline` dan `muted` aktif).
- [ ] **Fallback Filter Pixel Canvas**: Efek filter dan kecerahan tetap diterapkan dengan benar pada output gambar akhir di Safari.
- [ ] **Panduan Simpan ke Foto iOS**: Muncul instruksi "Tekan dan tahan gambar $\rightarrow$ Simpan ke Foto" saat menekan tombol Simpan Galeri.
- [ ] **Animasi GIF / Boomerang**: Generator GIF merender animasi pose dengan mulus dan dapat diunduh tanpa error.
- [ ] **Rotasi Layar**: Saat orientasi layar diputar (Portrait $\leftrightarrow$ Landscape), layout UI tetap proporsional.
- [ ] **Tab Backgrounding**: Saat beralih ke aplikasi lain lalu kembali ke Safari, kamera tidak membeku (auto-resume).

---

## 💻 3. Chrome / Edge Desktop (Laptop / PC)

- [ ] **Aksesibilitas & Keyboard**:
  - [ ] Navigasi tombol dapat diakses menggunakan tombol `Tab`.
  - [ ] Tombol `Escape` dapat menutup modal (Privacy, Terms, PIN, dsb.).
  - [ ] Elemen interaktif memiliki outline fokus yang jelas (`:focus-visible`).
- [ ] **Pengalih Tema & Bahasa**:
  - [ ] Tombol ☀️/🌙 beralih antara Mode Terang dan Mode Gelap seketika.
  - [ ] Tombol ID/EN mengubah seluruh teks antarmuka seketika dan tersimpan di `localStorage`.
- [ ] **Salin Gambar ke Clipboard**: Tombol "Salin Gambar" menyalin foto ke clipboard untuk langsung di-paste ke chat / dokumen.
- [ ] **Dashboard Admin (`/admin`)**:
  - [ ] Login email & password admin berhasil.
  - [ ] Buat event baru, upload logo PNG, dan upload custom frame PNG.
  - [ ] Buka Galeri Event $\rightarrow$ Uji tombol "Unduh Semua (ZIP)" $\rightarrow$ File `.zip` terunduh dengan semua foto di dalamnya.
  - [ ] Cek grafik statistik aktivitas per jam.

---

## 📟 4. Mode Tablet / Kiosk Stand (`/e/:slug?kiosk=1`)

- [ ] **Layar Penuh Otomatis**: Bilah navigasi umum disembunyikan.
- [ ] **Screen Wake Lock API**: Layar tablet tidak otomatis sleep / mati saat photobooth sedang standby.
- [ ] **Alur Berulang Otomatis Tanpa Operator**:
  - [ ] Sentuh layar sambut $\rightarrow$ Countdown $\rightarrow$ Ambil 4 pose foto.
  - [ ] Komposisi otomatis $\rightarrow$ Upload otomatis $\rightarrow$ Menampilkan QR Code unduh.
  - [ ] Bar hitungan mundur 30 detik berjalan.
  - [ ] Setelah 30 detik tanpa sentuhan $\rightarrow$ Sesi ter-reset bersih dan kembali ke layar sambut siap untuk tamu berikutnya.
- [ ] **Keamanan PIN Admin**:
  - [ ] Mengetuk tombol gembok 🔒 di kanan atas meminta PIN Admin.
  - [ ] PIN salah menampilkan pesan error.
  - [ ] PIN benar (`1234` atau sesuai pengaturan event) menghentikan sesi kiosk dan kembali ke dashboard.
- [ ] **Kode Akses Privat Event**: Jika event diberi kode akses, tamu diminta memasukkan kode sebelum bisa mengambil foto.
- [ ] **Event Non-Aktif**: Jika event dimatikan dari admin, halaman menampilkan informasi bahwa event telah ditutup.
