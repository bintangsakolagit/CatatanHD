# Riwayat perubahan

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan
[Semantic Versioning](https://semver.org/lang/id/).

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
