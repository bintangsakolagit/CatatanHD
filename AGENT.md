# Catatan Hemodialisa

Aplikasi berbasis web untuk Buku Catatan Pasien hemodialisa.

## Fitur

- adakan akun super admin untuk mengelola user
- daftar, login, dan logout untuk masuk dan keluar aplikasi
- buat halaman lupa password yang mencantumkan nomor admin
- data pasien hemodialisa untuk pendaftaran :
  - email aktif
  - username
  - password
  - nama
  - umur
  - alamat
  - berat badan kering
- data yang di catat pasien hemodialisa :
  - tanggal cuci darah
  - keluhan sebelum cuci darah
  - data waktu lama cuci darah (5 jam, 4.30 jam, 4 jam, 3.30 jam, 3 jam)
  - data berat badan sesi cuci darah kemarin terakhir
  - data berat badan hari ini
  - data berat badan setelah sesi cuci darah hari ini
  - hasil pengecekan tensi di sebelum sesi cuci darah
  - hasil pengecekan secara berkala ketika sesi cuci darah berlangsung
  - hasil pengecekan tensi di sebelum sesi cuci darah di akhri sesi cuci darah
  - data catatan kejadian atau yang dirasakan selama proses cuci darah
  - hasil pengecekan HB ketika 1 bulan 1x
  - hasil pengecekan urem dan kreatinin 1 tahun 1x
- untuk data yang di catat pasien saya ingin ada histori data atau rangkuman data dengan rentan tanggal cuci darah

## Skema Database

- Tabel disesuaikan dengan daftar Fitur
- Jika user tidak login dalam 3 bulan maka otomatis semua histori data yang berelasi pada user tersebut dihapus dari database

## Technology Stack

- JS runtime node.js
- Framework next.js
- react
- typescript
- Supabase
- severless netlify

## Struktur Proyek

- Gunakan struktur proyek layaknya senior developer Technolgoy Stack diatas

## Desain

- tailwind
- Rapih dan bersih
- Berjalan mulus di browser
- Layout login minimalis
- Bentuk component squircle
- Fitur Dark/Light mode
- Warna:
  - Tombol primary memakai gradien teal dengan teks putih
  - Tombol secondary putih dengan border lembut
  - Card putih kehijauan dengan border lembut dan bayangan tipis
  - Amber, cyan, dan lila dipakai sebagai aksen pembeda jenis data
- Hindari permukaan abu-abu datar; gunakan latar lembut berwarna dan ikon garis
- Responsive untuk tampilan mobile dan tablet
- Font OpenSans

## Aturan dan Gaya Coding

- Pisahkan antara Backend dan Frontend:
  - `be` untuk folder backend
  - `fe` untuk folder frontend
- Penulisan code rapih layaknya senior developer
- Coding harus mudah dibaca dan dipahami
- Backend hanya mengakses database melalui Supabase di sisi server. Tidak ada
  akses database langsung dari browser dan tidak ada file database lokal.
- Sematkan komentar disetiap code dan penjelasan alur code supaya dapat dipelajari
- Komentar code harus bahasa indonesia natural dan profesional
- Gunakan UX Writing bahasa indonesia natural, hindari kata-kata berlebih atau rancu

## Instruksi Testing

- Testing menggunakan tool sesuai Technology Stack
- Setiap pembuatan/perubahan fitur wajib uji sampai lolos

## Pedoman Commit

- Commit hanya dilakukan jika testing lulus
- Format penulisan commit:
  - `feat:...` untuk fitur
  - `fix:...` untuk perbaikan bug
  - `update:...` untuk perubahan UI/UX dan UX writing/bahasa
- Ubah versi setiap perubahan
- Catat setiap perubahan kedalam `CHANGELOG.md`

## Larangan

- Jangan commit file/folder penting dan rahasia
- Jangan pakai UX Writing atau bahasa AI slop
- Pokoknya anti AI slop, baik UX Writing maupun UI
- Jangan expose database keluar

## perbaikan 1

- pasien belum bisa daftar pada form daftar pada aplikasi yang sudah di deploy ke netlify dan supabase

## perbaikan 2

- pendaftaran di situs produksi sudah berhasil diuji lewat browser: pendaftar langsung masuk ke
  beranda, dan isian formulir tetap ada ketika email sudah terdaftar.
- penyebab pendaftaran gagal sebelumnya adalah email konfirmasi tidak terkirim karena domain
  pengirim belum terverifikasi di Resend. Konfirmasi email dimatikan sementara sampai domain siap.
- halaman produksi menampilkan `Minified React error #418` di konsol. Ini bug upstream React pada
  streaming hydration (react#37321), bukan perbedaan data aplikasi. Hidrasi tetap berhasil.

## perbaikan 3

- tampilan diubah semenarik mungkin tidak abu dan hitam sebih berwarna dan moderen mengacu pada user friendly
- untuk pengisian form bisakan di kelompokan antara data sebelum cuci darah dan data pengisian berkala ketika cuci darah dan di akhir sesi cuci darah
- form dan alur pengisian di buat mudah dan sederhana karena pengguna kebanyakan orang tua mengacu pada user friendly

### Hasil implementasi perbaikan 3

- Palet baru: teal sebagai warna tindakan utama, amber untuk penanda, cyan dan lila untuk
  membedakan jenis data. Permukaan putih kehijauan, border lembut, dan bayangan tipis
  menggantikan tampilan abu-abu dengan garis hitam.
- Navigasi dan tombol memakai ikon garis bawaan (`components/ui/ikon.tsx`) tanpa menambah
  pustaka, dengan target sentuh lebih besar agar nyaman bagi pengguna lanjut usia.
- Formulir sesi dibagi menjadi tiga langkah: Sebelum, Selama, dan Setelah cuci darah.
  Perpindahan langkah memakai tombol Lanjut dan Kembali; seluruh bagian tetap terpasang di
  DOM sehingga isian tidak hilang saat berpindah langkah.
- Validasi tahap berjalan di browser lewat `lib/tahap-sesi.ts`, sedangkan validasi lengkap
  tetap dijalankan server. Galat server otomatis membuka langkah yang bermasalah.
- Halaman detail sesi disusun ulang mengikuti urutan sebelum, selama, dan setelah agar sama
  dengan alur pengisian.
