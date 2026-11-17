# Riwayat perubahan

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan
[Semantic Versioning](https://semver.org/lang/id/).

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
- Fungsi Netlify terjadwal untuk menjalankan retensi harian di produksi.

### Catatan teknis

- Frontend berada di `fe/`, backend server-only di `be/` sebagai paket `@catatanhd/be`.
  Browser tidak pernah mengakses database secara langsung.
- Next.js 16 memakai `proxy.ts` untuk penyegaran sesi; pemeriksaan role dilakukan di
  layout dan Server Action.
- Durasi disimpan dalam menit, tanggal lahir disimpan sebagai tanggal dan umurnya
  dihitung saat ditampilkan.
