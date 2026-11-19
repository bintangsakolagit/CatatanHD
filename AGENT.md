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
  - Tombol primary hitam
  - Tombol secondary putih
  - Card putih dengan border hitam
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