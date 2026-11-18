'use server'

import { redirect } from 'next/navigation'
import { buatKlienServer } from '@catatanhd/be/supabase/server'
import { skemaMasuk } from '@catatanhd/be/schema/profil'
import { uraiGalatZod } from '@catatanhd/be/schema/bantuan'
import { catatLogin } from '@catatanhd/be/services/profil'
import { daftarPasien } from '@catatanhd/be/services/pendaftaran'
import { bacaForm } from './bantuan'
import type { StatusForm } from './tipe'

/**
 * Masuk dengan email dan password.
 * Setelah sesi terbentuk, waktu masuk dicatat untuk kebutuhan retensi,
 * lalu pengguna diarahkan ke halaman yang tadi ingin dibuka.
 */
export async function aksiMasuk(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const mentah = bacaForm(data)
  const email = mentah.email ?? ''
  // Email dikembalikan agar pengguna tidak mengetik ulang setelah gagal masuk.
  const ulangEmail = { nilai: { email }, kunci: Date.now() }
  const uji = skemaMasuk.safeParse(mentah)
  if (!uji.success) return { galat: uraiGalatZod(uji.error), ...ulangEmail }

  const supabase = await buatKlienServer()
  const { data: hasil, error } = await supabase.auth.signInWithPassword({
    email: uji.data.email,
    password: uji.data.password,
  })

  if (error || !hasil.user) {
    return { galat: { umum: 'Email atau password salah.' }, ...ulangEmail }
  }

  const { data: profil } = await supabase
    .from('profiles')
    .select('is_active, role')
    .eq('id', hasil.user.id)
    .maybeSingle()

  // Akun yang dinonaktifkan admin tidak boleh tetap punya sesi aktif.
  if (!profil || !profil.is_active) {
    await supabase.auth.signOut()
    return {
      galat: { umum: 'Akun ini tidak aktif. Hubungi admin untuk membukanya kembali.' },
      ...ulangEmail,
    }
  }

  await catatLogin()

  const lanjut = mentah.lanjut ?? ''
  const tujuanAman =
    lanjut.startsWith('/') && !lanjut.startsWith('//')
      ? lanjut
      : profil.role === 'super_admin'
        ? '/pengguna'
        : '/beranda'

  redirect(tujuanAman)
}

/** Pendaftaran pasien baru. Akun harus diverifikasi lewat email sebelum bisa masuk. */
export async function aksiDaftar(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const mentah = bacaForm(data)
  const muatan: Record<string, string> = {
    ...mentah,
    username: (mentah.username ?? '').trim().toLowerCase(),
    email: (mentah.email ?? '').trim().toLowerCase(),
  }

  const hasil = await daftarPasien(muatan)
  if (!hasil.ok) {
    // Password tidak pernah dikirim balik ke browser. Kolom lain dikembalikan
    // agar pengguna tidak perlu mengetik ulang seluruh formulir.
    return {
      galat: hasil.galat,
      nilai: {
        nama: muatan.nama ?? '',
        email: muatan.email ?? '',
        username: muatan.username ?? '',
        tanggal_lahir: muatan.tanggal_lahir ?? '',
        bb_kering_kg: muatan.bb_kering_kg ?? '',
        alamat: muatan.alamat ?? '',
      },
      kunci: Date.now(),
    }
  }

  return {
    sukses: true,
    pesan: `Akun dibuat. Buka email ${muatan.email} untuk verifikasi, lalu masuk.`,
  }
}

/** Keluar dan hapus cookie sesi. */
export async function aksiKeluar(): Promise<void> {
  const supabase = await buatKlienServer()
  await supabase.auth.signOut()
  redirect('/masuk')
}
