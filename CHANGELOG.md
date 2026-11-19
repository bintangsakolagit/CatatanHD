# Riwayat perubahan

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan
[Semantic Versioning](https://semver.org/lang/id/).

## [1.1.0] - 2026-11-19

Tampilan lebih berwarna dan formulir sesi tiga langkah yang lebih mudah dipakai.

### Diubah

- Palet warna baru: teal untuk tindakan utama, amber untuk penanda, serta cyan dan lila
  untuk membedakan jenis data. Latar putih kehijauan, border lembut, dan bayangan tipis
  menggantikan tampilan abu-abu dengan garis hitam.
- Navigasi atas dan bawah memakai ikon garis, tombol lebih besar, dan penanda langkah yang
  jelas agar nyaman dipakai pengguna lanjut usia.
- Halaman beranda memakai panel sambutan bergradien, kartu statistik berwarna, dan ringkasan
  sesi terakhir yang lebih mudah dipindai.
- Histori, laboratorium, profil, dan detail sesi memakai bahasa visual yang sama: lencana
  berwarna, kartu bertint, serta judul bagian berikon.
- Halaman masuk, daftar, dan lupa password dibungkus satu kartu dengan garis gradien di atas.

### Ditambahkan

- Formulir sesi tiga langkah: Sebelum, Selama, dan Setelah cuci darah. Seluruh bagian tetap
  terpasang sehingga isian tidak hilang saat berpindah langkah.
- Validasi per langkah di browser melalui `lib/tahap-sesi.ts`; galat dari server otomatis
  membuka langkah yang bermasalah.
- Tombol tambah pemeriksaan tensi berkala dengan kartu baris yang lebih lega.
- Uji unit untuk aturan tiap langkah dan pemetaan galat server ke langkah formulir.

## [1.0.4] - 2026-11-19

Catatan hasil verifikasi langsung pada situs produksi.

### Diperbaiki

- `.gitignore` kini mengabaikan `fe/AGENTS.md` yang dibuat ulang otomatis oleh `next dev`,
  agar status Git tidak terus kotor setelah menjalankan server pengembangan.

### Catatan

- Pendaftaran pasien pada situs produksi sudah diuji lewat browser: pendaftar langsung masuk ke
  beranda, dan isian formulir tetap tersedia saat email sudah terdaftar.
- Halaman produksi menampilkan `Minified React error #418` di konsol. Penyebabnya bug upstream
  React pada streaming hydration (<https://github.com/facebook/react/issues/37321>), bukan
  perbedaan data aplikasi. Hidrasi tetap berhasil dan seluruh fitur berjalan.

## [1.0.3] - 2026-11-18

Pendaftaran dapat dipakai sebelum domain pengirim email terverifikasi.

### Diubah

- Bila Supabase mengembalikan sesi langsung (konfirmasi email dimatikan), pendaftar
  diarahkan ke beranda tanpa diminta masuk dua kali.
- Pesan "periksa email" hanya muncul ketika verifikasi email benar-benar diperlukan,
  sehingga tidak menyesatkan saat konfirmasi email sedang dimatikan.

### Catatan

- Verifikasi email sebaiknya diaktifkan kembali setelah domain pengirim terverifikasi di
  Resend. Tanpa domain terverifikasi, Resend menolak pengiriman dan pendaftaran berhenti
  dengan pesan `Error sending confirmation email`.

## [1.0.2] - 2026-11-18

Perbaikan pengalaman formulir saat pendaftaran atau masuk gagal.

### Diperbaiki

- Isian formulir pendaftaran (nama, email, username, tanggal lahir, berat badan kering,
  alamat) dan email pada formulir masuk dikembalikan saat aksi gagal, sehingga pengguna
  tidak perlu mengetik ulang. Password sengaja tidak pernah dikirim balik ke browser.
- Formulir dimuat ulang dengan `key` dari server setiap kali aksi gagal, karena React
  mengosongkan formulir otomatis setelah Server Action selesai.
- Pesan pendaftaran kini membedakan kegagalan pengiriman email verifikasi dari kegagalan
  data, agar admin tahu bagian mana yang perlu diperbaiki.

## [1.0.1] - 2026-11-18

Perbaikan izin tabel yang membuat akun super admin gagal dibuat di project produksi.

### Diperbaiki

- Migrasi `0004_izin.sql` memberi `GRANT` tabel kepada role `authenticated` dan
  `service_role`. Project Supabase baru tidak lagi memberi izin otomatis pada skema
  `public`, sehingga `npm run admin:buat` berhenti dengan pesan
  `permission denied for table profiles` walaupun RLS sudah benar.
- Izin `update` pada tabel `profiles` tetap dibatasi per kolom agar pasien tidak dapat
  mengubah `role`, `email`, `is_active`, atau `last_login_at`.
- `anon` tetap tanpa hak tabel apa pun; RLS tetap menjadi lapisan kedua setelah izin
  tabel.

## [1.0.0] - 2026-11-18

Rilis pertama CatatanHD: buku catatan pasien hemodialisa dengan pemisahan frontend dan
backend, keamanan berbasis RLS, dan retensi data otomatis.

### Ditambahkan

- Pendaftaran pasien dengan verifikasi email, masuk, keluar, dan halaman lupa password
  yang mengarah ke WhatsApp admin.
- Catatan sesi cuci darah: tanggal, durasi (5 / 4,5 / 4 / 3,5 / 3 jam), keluhan sebelum
  sesi, berat badan kemarin / sebelum / sesudah, tensi sebelum dan akhir sesi, tensi
  berkala selama sesi, serta catatan kejadian.
- Hasil laboratorium: HB bulanan, ureum dan kreatinin tahunan, lengkap dengan penanda
  periode yang belum diperiksa.
- Histori dengan filter rentang tanggal, preset 1 bulan sampai 1 tahun, ringkasan angka,
  pagination, cetak, dan ekspor CSV.
- Panel super admin: pencarian nama/username/email, aktifkan dan nonaktifkan akun, kirim
  tautan reset password, hapus akun dengan konfirmasi username, serta jejak audit.
- Retensi otomatis: peringatan pada sisa 30 hari dan 7 hari, penghapusan akun beserta
  seluruh data pada hari ke-90 tidak aktif.
- Mode terang dan gelap, tata letak responsif, komponen bersudut besar, dan tipografi
  Open Sans.
- Migrasi Supabase: skema awal, kebijakan RLS, dan fungsi `catat_login`,
  `ringkasan_histori`, serta `cari_akun_pasif`.
- Skrip `npm run admin:buat` untuk membuat akun super admin lewat Admin API.
- Uji unit untuk validasi tanggal, durasi, profil, sesi, dan laboratorium.
- Uji RLS untuk memastikan pasien tidak dapat membaca atau mengubah data pasien lain,
  tidak dapat menaikkan role sendiri, dan fungsi retensi hanya terbuka untuk service role.
- Fungsi Netlify terjadwal untuk menjalankan retensi harian di produksi.

### Catatan teknis

- Frontend berada di `fe/`, backend server-only di `be/` sebagai paket `@catatanhd/be`.
  Browser tidak pernah mengakses database secara langsung.
- Next.js 16 memakai `proxy.ts` untuk penyegaran sesi; pemeriksaan role dilakukan di
  layout dan Server Action.
- Durasi disimpan dalam menit, tanggal lahir disimpan sebagai tanggal dan umurnya
  dihitung saat ditampilkan.
- `supabase/config.toml` mengikuti format Supabase CLI 3.x: server email lokal memakai
  bagian `[local_smtp]`, bukan `[inbucket]` yang sudah dihapus.
- Skrip `db:push` memakai `--remote` karena CLI 3.x menjadikan stack lokal sebagai target
  bawaan untuk `supabase db push`.
