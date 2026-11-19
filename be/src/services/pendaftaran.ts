import 'server-only'
import { skemaDaftar } from '../schema/profil'
import { uraiGalatZod } from '../schema/bantuan'
import { buatKlienAdmin } from '../supabase/admin'
import { buatKlienServer } from '../supabase/server'
import { opsionalEnv } from '../util/env'
import { berhasil, gagal, type Hasil } from '../util/hasil'

/**
 * Alur pendaftaran:
 * 1) Validasi seluruh data di server.
 * 2) Buat akun auth lewat signUp agar email verifikasi terkirim.
 * 3) Simpan profil memakai service role, karena pasien tidak diberi izin
 *    menulis tabel profil secara langsung.
 * 4) Jika penyimpanan profil gagal, akun auth yang terlanjur dibuat dihapus
 *    supaya tidak tersisa akun tanpa profil.
 */
export async function daftarPasien(masukan: unknown): Promise<Hasil<{ perluVerifikasi: boolean }>> {
  const uji = skemaDaftar.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const data = uji.data
  const admin = buatKlienAdmin()

  // Pemeriksaan awal agar pesan galat jelas. Constraint unik di database tetap
  // menjadi pengaman terakhir bila dua pendaftaran berjalan bersamaan.
  const { data: usernameTerpakai } = await admin
    .from('profiles')
    .select('id')
    .eq('username', data.username)
    .maybeSingle()

  if (usernameTerpakai) return gagal({ username: 'Username sudah dipakai.' })

  const supabase = await buatKlienServer()
  const alamatSitus = opsionalEnv('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000'

  const { data: hasilDaftar, error: galatDaftar } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${alamatSitus}/auth/konfirmasi`,
      data: { nama: data.nama, username: data.username },
    },
  })

  if (galatDaftar) {
    if (galatDaftar.code === 'user_already_exists') {
      return gagal({ email: 'Email sudah terdaftar. Masuk atau hubungi admin.' })
    }
    if (galatDaftar.code === 'weak_password') {
      return gagal({ password: 'Password terlalu lemah. Gunakan kombinasi huruf dan angka.' })
    }
    if (galatDaftar.code === 'over_email_send_rate_limit') {
      return gagal({ umum: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.' })
    }
    // Supabase membatalkan pendaftaran bila email verifikasi tidak terkirim,
    // misalnya karena SMTP belum benar. Pesannya dibuat jelas agar admin tahu
    // yang perlu diperbaiki bukan data pendaftar.
    if (galatDaftar.message.toLowerCase().includes('confirmation email')) {
      return gagal({
        umum: 'Email verifikasi gagal dikirim. Coba lagi beberapa saat atau hubungi admin.',
      })
    }
    return gagal({ umum: 'Pendaftaran gagal. Coba lagi beberapa saat.' })
  }

  const pengguna = hasilDaftar.user
  if (!pengguna) {
    return gagal({ umum: 'Pendaftaran gagal. Coba lagi beberapa saat.' })
  }

  // Supabase mengembalikan identitas kosong bila email sudah terdaftar pada
  // project dengan konfirmasi email aktif. Ini mencegah pendaftaran ganda.
  if (pengguna.identities && pengguna.identities.length === 0) {
    return gagal({ email: 'Email sudah terdaftar. Masuk atau minta reset password ke admin.' })
  }

  const { error: galatProfil } = await admin.from('profiles').insert({
    id: pengguna.id,
    email: data.email,
    role: 'pasien',
    username: data.username,
    nama: data.nama,
    tanggal_lahir: data.tanggal_lahir,
    alamat: data.alamat,
    bb_kering_kg: data.bb_kering_kg,
  })

  if (galatProfil) {
    // Rollback: jangan tinggalkan akun auth tanpa profil.
    await admin.auth.admin.deleteUser(pengguna.id)

    if (galatProfil.code === '23505') {
      return gagal({ username: 'Username sudah dipakai.' })
    }
    return gagal({ umum: 'Profil gagal disimpan. Coba lagi beberapa saat.' })
  }

  // Tanpa konfirmasi email, Supabase langsung membuat sesi. Nilai ini dipakai
  // lapisan aksi untuk menentukan apakah pengguna masih perlu memeriksa email.
  return berhasil({ perluVerifikasi: !hasilDaftar.session })
}
