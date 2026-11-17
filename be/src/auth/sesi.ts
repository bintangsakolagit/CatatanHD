import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { Profil } from '../types/database'
import { buatKlienServer } from '../supabase/server'

export interface SesiAktif {
  id: string
  email: string
  profil: Profil
}

/**
 * Mengambil pengguna dan profilnya sekali per permintaan.
 * `cache` dari React mencegah query profil berulang saat layout dan halaman
 * sama-sama membutuhkannya.
 */
export const ambilSesi = cache(async (): Promise<SesiAktif | null> => {
  const supabase = await buatKlienServer()
  const { data: hasilAuth, error } = await supabase.auth.getUser()
  if (error || !hasilAuth.user) return null

  const { data: profil } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', hasilAuth.user.id)
    .maybeSingle()

  // Akun tanpa profil berarti pendaftaran tidak selesai. Akun nonaktif
  // diperlakukan sama seperti belum masuk agar tidak ada data yang terbuka.
  if (!profil || !profil.is_active) return null

  return {
    id: hasilAuth.user.id,
    email: hasilAuth.user.email ?? profil.email,
    profil,
  }
})

/** Dipakai di halaman yang mengharuskan pengguna masuk. */
export async function wajibLogin(): Promise<SesiAktif> {
  const sesi = await ambilSesi()
  if (!sesi) redirect('/masuk')
  return sesi
}
