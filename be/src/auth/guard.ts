import 'server-only'
import { redirect } from 'next/navigation'
import { wajibLogin, type SesiAktif } from './sesi'

/**
 * Membatasi halaman panel admin.
 * Pengguna biasa diarahkan kembali ke beranda tanpa diberi tahu bahwa halaman
 * admin ada, sehingga tidak ada informasi struktur internal yang bocor.
 */
export async function wajibAdmin(): Promise<SesiAktif> {
  const sesi = await wajibLogin()
  if (sesi.profil.role !== 'super_admin') redirect('/beranda')
  return sesi
}
