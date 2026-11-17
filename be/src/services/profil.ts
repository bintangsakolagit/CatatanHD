import 'server-only'
import { skemaUbahPassword, skemaUbahProfil } from '../schema/profil'
import { uraiGalatZod } from '../schema/bantuan'
import { buatKlienServer } from '../supabase/server'
import type { Profil } from '../types/database'
import { berhasil, gagal, type Hasil } from '../util/hasil'

/** Profil pasien: membaca, menyunting data dasar, dan mencatat waktu masuk terakhir. */

export async function ambilProfil(pasienId: string): Promise<Profil | null> {
  const supabase = await buatKlienServer()
  const { data } = await supabase.from('profiles').select('*').eq('id', pasienId).maybeSingle()
  return data
}

export async function ubahProfil(pasienId: string, masukan: unknown): Promise<Hasil> {
  const uji = skemaUbahProfil.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { error } = await supabase
    .from('profiles')
    .update({
      nama: uji.data.nama,
      username: uji.data.username,
      tanggal_lahir: uji.data.tanggal_lahir,
      alamat: uji.data.alamat,
      bb_kering_kg: uji.data.bb_kering_kg,
    })
    .eq('id', pasienId)

  if (error) {
    if (error.code === '23505') return gagal({ username: 'Username sudah dipakai.' })
    if (error.code === '42501') {
      return gagal({ umum: 'Data ini hanya dapat diubah oleh admin.' })
    }
    return gagal({ umum: 'Profil gagal disimpan. Coba lagi.' })
  }

  return berhasil(undefined)
}

export async function ubahPassword(masukan: unknown): Promise<Hasil> {
  const uji = skemaUbahPassword.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { error } = await supabase.auth.updateUser({ password: uji.data.password_baru })

  if (error) return gagal({ umum: 'Password gagal diubah. Coba lagi beberapa saat.' })
  return berhasil(undefined)
}

/**
 * Mencatat waktu masuk terakhir. Nilai ini dipakai job retensi agar akun yang
 * sudah tiga bulan tidak aktif bisa dihapus bersama seluruh datanya.
 */
export async function catatLogin(): Promise<void> {
  const supabase = await buatKlienServer()
  await supabase.rpc('catat_login')
}
