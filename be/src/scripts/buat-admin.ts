/**
 * Membuat akun super admin pertama.
 *
 * Mengapa lewat skrip, bukan seed.sql:
 * tabel auth.users dan auth.identities berbeda antar versi Supabase. Admin API
 * resmi menangani detail tersebut, lalu profil dibuat dengan role super_admin.
 *
 * Jalankan: npm run admin:buat
 * Membutuhkan: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *              ADMIN_EMAIL, ADMIN_PASSWORD
 */

import { createClient } from '@supabase/supabase-js'

/** Mengambil env wajib; berhenti dengan pesan jelas bila kosong. */
function perlu(nama: string): string {
  const nilai = process.env[nama]
  if (!nilai || nilai.trim() === '') {
    console.error(`Variabel ${nama} belum diisi di fe/.env.local.`)
    process.exit(1)
  }
  return nilai
}

const url = perlu('NEXT_PUBLIC_SUPABASE_URL')
const kunci = perlu('SUPABASE_SERVICE_ROLE_KEY')
const email = perlu('ADMIN_EMAIL')
const password = perlu('ADMIN_PASSWORD')

if (password.length < 8) {
  console.error('ADMIN_PASSWORD minimal 8 karakter.')
  process.exit(1)
}

const nama = process.env.ADMIN_NAMA ?? 'Super Admin'
const username = process.env.ADMIN_USERNAME ?? 'admin'

const admin = createClient(url, kunci, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
})

async function main() {
  // 1) Cari akun berdasarkan email agar skrip aman dijalankan berulang.
  const { data: daftar, error: galatDaftar } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (galatDaftar) throw new Error(`Gagal membaca daftar akun: ${galatDaftar.message}`)

  const akunAda = daftar.users.find((akun) => akun.email?.toLowerCase() === email.toLowerCase())

  let id = akunAda?.id

  if (!id) {
    const { data: dibuat, error: galatBuat } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama },
    })
    if (galatBuat || !dibuat.user) {
      throw new Error(`Gagal membuat akun admin: ${galatBuat?.message ?? 'tanpa keterangan'}`)
    }
    id = dibuat.user.id
    console.log(`Akun auth dibuat: ${email}`)
  } else {
    console.log(`Akun auth sudah ada: ${email}`)
  }

  // 2) Buat atau perbarui profil dengan role super_admin.
  const { error: galatProfil } = await admin.from('profiles').upsert(
    {
      id,
      email,
      role: 'super_admin',
      username,
      nama,
      tanggal_lahir: '1990-01-01',
      alamat: 'Kantor unit hemodialisa',
      bb_kering_kg: 60,
      is_active: true,
    },
    { onConflict: 'id' },
  )

  if (galatProfil) throw new Error(`Gagal menyimpan profil admin: ${galatProfil.message}`)

  console.log(`Super admin siap. Masuk dengan email ${email} lalu segera ganti password.`)
}

main().catch((kesalahan: unknown) => {
  console.error(kesalahan instanceof Error ? kesalahan.message : kesalahan)
  process.exit(1)
})
