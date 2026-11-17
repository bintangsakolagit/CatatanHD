'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { wajibAdmin } from '@catatanhd/be/auth/guard'
import {
  hapusPengguna,
  resetPasswordPengguna,
  ubahStatusPengguna,
} from '@catatanhd/be/services/pengguna'
import type { StatusForm } from './tipe'

/**
 * Aksi panel admin. Setiap aksi memanggil wajibAdmin() lebih dulu agar
 * service role tidak pernah bisa dipicu dari sesi pasien.
 */

export async function aksiUbahStatus(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin()
  const id = String(data.get('id') ?? '')
  const aktif = String(data.get('aktif') ?? '') === '1'

  if (!id) return { galat: { umum: 'Akun tidak dikenali.' } }
  if (id === admin.id) return { galat: { umum: 'Status akun sendiri tidak dapat diubah.' } }

  const hasil = await ubahStatusPengguna(id, aktif, admin.id)
  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/pengguna')
  revalidatePath(`/pengguna/${id}`)
  return { sukses: true, pesan: aktif ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.' }
}

export async function aksiResetPassword(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin()
  const id = String(data.get('id') ?? '')
  if (!id) return { galat: { umum: 'Akun tidak dikenali.' } }

  const hasil = await resetPasswordPengguna(id, admin.id)
  if (!hasil.ok) return { galat: hasil.galat }

  return {
    sukses: true,
    pesan: hasil.data.terkirim
      ? 'Tautan reset password dikirim ke email pasien.'
      : 'Email belum terkirim. Salin tautan di bawah dan kirim lewat WhatsApp.',
    tautan: hasil.data.tautan ?? undefined,
  }
}

export async function aksiHapusPengguna(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const admin = await wajibAdmin()
  const id = String(data.get('id') ?? '')
  const konfirmasi = String(data.get('konfirmasi') ?? '')

  if (!id) return { galat: { umum: 'Akun tidak dikenali.' } }
  if (id === admin.id) return { galat: { umum: 'Akun sendiri tidak dapat dihapus dari panel.' } }
  if (konfirmasi.trim().length < 3) {
    return { galat: { konfirmasi: 'Ketik username akun untuk mengonfirmasi penghapusan.' } }
  }

  const hasil = await hapusPengguna(id, admin.id, konfirmasi)
  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/pengguna')
  redirect('/pengguna')
}
