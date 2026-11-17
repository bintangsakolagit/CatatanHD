'use server'

import { revalidatePath } from 'next/cache'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { hapusLab, simpanLab, simpanLabPasangan } from '@catatanhd/be/services/lab'
import { bacaForm } from './bantuan'
import type { StatusForm } from './tipe'

export async function aksiSimpanHb(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const hasil = await simpanLab(sesi.id, { ...bacaForm(data), jenis: 'hb' })

  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/lab')
  revalidatePath('/beranda')
  return { sukses: true, pesan: 'Hasil HB tersimpan.' }
}

export async function aksiSimpanUreumKreatinin(
  _status: StatusForm,
  data: FormData,
): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const hasil = await simpanLabPasangan(sesi.id, bacaForm(data))

  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/lab')
  revalidatePath('/beranda')
  return { sukses: true, pesan: 'Hasil ureum dan kreatinin tersimpan.' }
}

export async function aksiHapusLab(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const id = String(data.get('id') ?? '')
  if (!id) return { galat: { umum: 'Data pemeriksaan tidak dikenali.' } }

  const hasil = await hapusLab(sesi.id, id)
  if (!hasil.ok) return { galat: hasil.galat }

  revalidatePath('/lab')
  revalidatePath('/beranda')
  return { sukses: true, pesan: 'Data pemeriksaan dihapus.' }
}
