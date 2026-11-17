'use server'

import { revalidatePath } from 'next/cache'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ubahPassword, ubahProfil } from '@catatanhd/be/services/profil'
import { bacaForm } from './bantuan'
import type { StatusForm } from './tipe'

export async function aksiUbahProfil(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const mentah = bacaForm(data)
  const hasil = await ubahProfil(sesi.id, {
    ...mentah,
    username: (mentah.username ?? '').toLowerCase(),
  })

  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/profil')
  revalidatePath('/beranda')
  return { sukses: true, pesan: 'Profil tersimpan.' }
}

export async function aksiUbahPassword(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const hasil = await ubahPassword(bacaForm(data))

  if (!hasil.ok) return { galat: hasil.galat }
  return { sukses: true, pesan: 'Password baru sudah aktif. Gunakan saat masuk berikutnya.' }
}
