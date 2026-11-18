# CatatanHD

Buku catatan pribadi untuk pasien hemodialisa. Pasien mencatat sesi cuci darah, tensi
berkala, dan hasil laboratorium; super admin mengelola akun dari satu panel.

Aplikasi ini **bukan rekam medis resmi**. Data yang disimpan adalah salinan yang diketik
sendiri oleh pasien atau keluarganya.

## Isi aplikasi

- Pendaftaran, verifikasi email, masuk, keluar, dan halaman lupa password yang mengarah ke
  WhatsApp admin.
- Catatan per sesi: tanggal, lama cuci darah, keluhan sebelum sesi, berat badan kemarin /
  sebelum / sesudah, tensi sebelum dan akhir sesi, serta tensi berkala selama sesi.
- Laboratorium: HB bulanan, ureum dan kreatinin tahunan, dengan penanda bila periode
  pemeriksaan terlewat.
- Histori dengan filter rentang tanggal, ringkasan angka, cetak, dan ekspor CSV.
- Panel super admin: cari pengguna, aktifkan/nonaktifkan akun, kirim tautan reset password,
  dan hapus akun beserta seluruh catatannya.
- Retensi otomatis: akun pasien yang tidak masuk selama 3 bulan dihapus bersama datanya.
  Peringatan dikirim saat sisa 30 hari dan sisa 7 hari.
- Mode terang dan gelap, tata letak responsif, serta komponen bersudut besar (squircle).

## Tumpukan

| Bagian    | Teknologi                                                  |
| --------- | ---------------------------------------------------------- |
| Antarmuka | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| Server    | Server Component, Server Action, Route Handler             |
| Database  | Supabase Postgres + Auth, diamankan Row Level Security     |
| Email     | Resend (verifikasi akun dan peringatan retensi)            |
| Deploy    | Netlify (satu situs, termasuk fungsi retensi harian)       |
| Uji       | Vitest                                                     |

## Struktur folder

```text
.
├─ fe/                     # Aplikasi Next.js (UI, Server Action, route handler)
│  └─ src/
│     ├─ app/              # Halaman dan route handler
│     ├─ actions/          # Server Action yang dipanggil formulir
│     ├─ components/       # Komponen tampilan
│     └─ lib/              # Pemformatan angka dan tanggal untuk UI
├─ be/                     # Paket server-only @catatanhd/be
│  ├─ src/
│  │  ├─ schema/           # Validasi zod, dipakai server
│  │  ├─ services/         # Aturan bisnis dan akses Supabase
│  │  ├─ supabase/         # Klien server, admin, dan penyegar sesi
│  │  ├─ auth/             # wajibLogin dan wajibAdmin
│  │  ├─ util/             # Tanggal, durasi, env, bentuk hasil
│  │  └─ scripts/          # Pembuat akun super admin
│  └─ tests/               # Uji unit
├─ supabase/
│  ├─ migrations/          # Skema, RLS, dan fungsi SQL
│  ├─ seed.sql             # Kosong; admin dibuat lewat skrip
│  └─ config.toml          # Konfigurasi Supabase lokal
└─ netlify/functions/      # Pemicu retensi harian
```

Frontend dan backend dipisah sebagai dua npm workspace. `fe` hanya berisi tampilan dan
Server Action; seluruh query database berada di `be`, dan `be` menandai dirinya
`server-only` sehingga tidak mungkin ikut ke bundel browser.

## Menjalankan di lokal

### Prasyarat

- Node.js 22 atau lebih baru (repo diuji dengan Node 24).
- npm 10 atau lebih baru.
- Docker Desktop, untuk Supabase lokal.
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`).

### Langkah

1. Pasang dependensi dari akar repo:

   ```bash
   npm install
   ```

2. Salin variabel lingkungan, lalu isi nilainya:

   ```bash
   cp .env.example fe/.env.local
   ```

3. Nyalakan Supabase lokal, lalu terapkan migrasi:

   ```bash
   supabase start
   supabase db reset
   ```

4. Ambil `anon key` dan `service_role key` dari keluaran `supabase status`, lalu isi
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan
   `SUPABASE_SERVICE_ROLE_KEY` di `fe/.env.local`.

5. Buat akun super admin pertama:

   ```bash
   npm run admin:buat
   ```

   Perintah ini membaca `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `ADMIN_WHATSAPP` dari
   `fe/.env.local`. Aman dijalankan berulang: akun yang sudah ada akan diperbarui, bukan
   diduplikasi.

6. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka <http://localhost:3000>. Super admin diarahkan ke `/pengguna`, pasien ke
   `/beranda`.

Catatan Supabase lokal: konfirmasi email dimatikan di `supabase/config.toml` agar
pengembangan tidak perlu membuka kotak masuk. Email lokal bisa dilihat di Inbucket pada
<http://localhost:54324>. Di produksi, konfirmasi email harus aktif.

## Variabel lingkungan

Semua variabel dibaca dari `fe/.env.local` saat pengembangan dan dari environment Netlify
saat deploy.

| Nama                            | Wajib | Keterangan                                                      |
| ------------------------------- | :---: | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |  ya   | Alamat project Supabase.                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |  ya   | Kunci publik; akses tetap dibatasi RLS.                         |
| `SUPABASE_SERVICE_ROLE_KEY`     |  ya   | Hanya untuk server. Jangan pernah diberi awalan `NEXT_PUBLIC_`. |
| `RESEND_API_KEY`                |  ya   | Pengiriman email verifikasi dan peringatan retensi.             |
| `EMAIL_PENGIRIM`                |  ya   | Contoh: `CatatanHD <no-reply@domain.id>`.                       |
| `ADMIN_EMAIL`                   |  ya   | Dipakai `npm run admin:buat`.                                   |
| `ADMIN_PASSWORD`                |  ya   | Minimal 8 karakter.                                             |
| `ADMIN_WHATSAPP`                |  ya   | Nomor tujuan di halaman lupa password.                          |
| `ADMIN_NAMA`                    | tidak | Nama tampilan super admin. Bawaan `Super Admin`.                |
| `ADMIN_USERNAME`                | tidak | Username super admin. Bawaan `admin`.                           |
| `APP_TZ`                        | tidak | Zona waktu perhitungan tanggal. Bawaan `Asia/Jakarta`.          |
| `CRON_SECRET`                   |  ya   | Rahasia pemanggil endpoint retensi.                             |
| `NEXT_PUBLIC_SITE_URL`          |  ya   | Alamat publik aplikasi untuk tautan email dan reset.            |

Buat `CRON_SECRET` yang panjang dan acak, misalnya:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Skrip

| Perintah             | Kegunaan                                            |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Menjalankan Next.js dalam mode pengembangan.        |
| `npm run build`      | Build produksi.                                     |
| `npm run start`      | Menjalankan hasil build.                            |
| `npm run typecheck`  | Memeriksa tipe `be` dan `fe`.                       |
| `npm run lint`       | ESLint untuk seluruh repo.                          |
| `npm run format`     | Memeriksa format Prettier.                          |
| `npm run test`       | Uji unit Vitest.                                    |
| `npm run test:rls`   | Uji RLS (butuh Supabase lokal menyala).             |
| `npm run db:reset`   | Mengulang migrasi dan seed Supabase lokal.          |
| `npm run db:push`    | Menerapkan migrasi ke project tertaut (`--remote`). |
| `npm run db:types`   | Membuat ulang tipe database dari Supabase lokal.    |
| `npm run admin:buat` | Membuat atau memperbarui akun super admin.          |

Selalu jalankan `typecheck`, `lint`, dan `test` sebelum commit. Build juga perlu dicek
setelah mengubah halaman atau konfigurasi.

Uji RLS membutuhkan Supabase lokal yang menyala dan otomatis dilewati bila kredensial
belum tersedia. Perintah `npm run test:rls` memuat `fe/.env.local`, lalu membuat dua akun
uji sementara dan memeriksa bahwa keduanya tidak bisa saling melihat data. Akun uji dihapus
kembali di akhir. Untuk memakai project uji terpisah, isi `SUPABASE_TEST_URL`,
`SUPABASE_TEST_ANON_KEY`, dan `SUPABASE_TEST_SERVICE_ROLE_KEY`.

## Keamanan data

- Browser hanya berbicara ke Supabase memakai `anon key`; RLS memastikan pasien hanya
  membaca dan menulis barisnya sendiri.
- `service_role key` hanya dipakai di `be/src/supabase/admin.ts` dan tidak pernah dikirim
  ke klien.
- Kolom profil yang boleh diubah pasien dibatasi di tingkat kolom: `nama`, `username`,
  `tanggal_lahir`, `alamat`, dan `bb_kering_kg`. `role`, `is_active`, dan `email` hanya bisa
  diubah lewat server.
- Setiap Server Action yang menyentuh data pengguna memanggil `wajibLogin()`, dan aksi admin
  memanggil `wajibAdmin()`.
- Penghapusan akun meminta admin mengetik username; pemeriksaan kecocokan dilakukan di
  server.
- Endpoint `/api/cron/retensi` menolak permintaan tanpa `x-cron-secret` yang cocok.

## Retensi 3 bulan

Aturan yang dijalankan `jalankanRetensi()`:

1. Akun pasien tanpa aktivitas masuk selama 90 hari dihapus. Profil, sesi, tensi berkala,
   laboratorium, dan catatan peringatan ikut terhapus lewat `ON DELETE CASCADE`.
2. Pada hari ke-60 tidak aktif (sisa 30 hari), email peringatan pertama dikirim.
3. Pada hari ke-83 tidak aktif (sisa 7 hari), email peringatan terakhir dikirim.
4. Akun yang dinonaktifkan admin dan akun super admin tidak ikut diproses.
5. Setiap peringatan dicatat di `retention_notices`, sehingga tidak terkirim dua kali.

Fungsi SQL `cari_akun_pasif` hanya mengembalikan akun yang masih butuh tindakan. Ini
mencegah antrean macet oleh akun yang peringatannya sudah terkirim.

Job berjalan sekali sehari. Untuk menguji manual:

```bash
curl -X POST http://localhost:3000/api/cron/retensi \
  -H "x-cron-secret: RAHASIA_ANDA"
```

## Deploy ke Netlify

Sebelum deploy pertama, terapkan skema ke project produksi:

```bash
npx supabase link --project-ref <project-ref-anda>
npm run db:push
```

Sejak Supabase CLI 3.x, `supabase db push` tanpa opsi menargetkan stack lokal. Karena itu
skrip repo memakai `db push --remote`. Untuk memeriksa tanpa mengubah apa pun, jalankan
`npx supabase db push --dry-run --remote`.

1. Hubungkan repo ke Netlify. Saat Netlify mendeteksi monorepo, pilih folder `fe` sebagai
   **package directory**. Biarkan **base directory** di akar repo.
2. Build command `npm run build`, publish directory `fe/.next` sudah diatur di
   `netlify.toml`. Plugin `@netlify/plugin-nextjs` menangani SSR dan route handler.
3. Isi seluruh variabel lingkungan di **Site configuration → Environment variables**.
   Gunakan kunci project Supabase produksi, bukan kunci lokal.
4. Di Supabase → Authentication → URL Configuration, isi **Site URL** dengan domain
   produksi dan tambahkan `https://domain-anda/auth/konfirmasi` ke **Redirect URLs**.
5. Aktifkan konfirmasi email dan pasang SMTP Resend di Supabase agar email verifikasi
   terkirim.
6. Deploy. Fungsi `netlify/functions/retensi.mts` otomatis terdaftar dengan jadwal harian
   dan hanya berjalan pada konteks `production`; deploy preview dilewati.
7. Setelah deploy pertama, jalankan `npm run admin:buat` dengan env produksi untuk membuat
   super admin.

Next.js 16 memakai `fe/src/proxy.ts` (bukan `middleware.ts`). Berkas ini menyegarkan cookie
sesi dan mengarahkan pengguna yang belum masuk; pemeriksaan role tetap dilakukan di server.

## Pemecahan masalah

- **`Variabel lingkungan ... belum diisi`** — pastikan `fe/.env.local` ada dan diisi, lalu
  mulai ulang `npm run dev`.
- **`permission denied for table profiles`** — migrasi izin tabel belum diterapkan.
  Jalankan `npm run db:push`, lalu ulangi `npm run admin:buat`. Project Supabase baru
  tidak lagi memberi izin tabel otomatis pada skema `public`.
- **Pendaftaran berhasil tetapi email tidak masuk** — periksa `RESEND_API_KEY`,
  `EMAIL_PENGIRIM`, dan folder spam. Di lokal, buka antarmuka email pada
  <http://localhost:54324>.
- **Tautan verifikasi mengarah ke localhost** — samakan `NEXT_PUBLIC_SITE_URL` dengan
  domain produksi dan perbarui Redirect URLs di Supabase.
- **Admin tidak bisa membuka `/pengguna`** — pastikan profil akun tersebut memiliki
  `role = 'super_admin'`. Jalankan ulang `npm run admin:buat`.
- **Tipe database berubah setelah migrasi** — jalankan `npm run db:types`, lalu
  `npm run typecheck`.
