'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { hapusSesi, simpanSesi, ubahSesi } from '@catatanhd/be/services/sesi'
import { bacaForm, bacaJson } from './bantuan'
import type { StatusForm } from './tipe'

/** Menyusun muatan sesi dari FormData, termasuk baris tensi berkala. */
function muatanSesi(data: FormData) {
  return { ...bacaForm(data), tensi: bacaJson(data, 'tensi') ?? [] }
}

function segarkanHalamanSesi(sesiId?: string) {
  revalidatePath('/beranda')
  revalidatePath('/histori')
  if (sesiId) revalidatePath(`/catatan/${sesiId}`)
}

export async function aksiSimpanSesi(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const hasil = await simpanSesi(sesi.id, muatanSesi(data))

  if (!hasil.ok) return { galat: hasil.galat }

  segarkanHalamanSesi(hasil.data.id)
  redirect(`/catatan/${hasil.data.id}`)
}

export async function aksiUbahSesi(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const id = String(data.get('id') ?? '')
  if (!id) return { galat: { umum: 'Catatan tidak dikenali.' } }

  const hasil = await ubahSesi(sesi.id, id, muatanSesi(data))
  if (!hasil.ok) return { galat: hasil.galat }

  segarkanHalamanSesi(id)
  redirect(`/catatan/${id}`)
}

export async function aksiHapusSesi(_status: StatusForm, data: FormData): Promise<StatusForm> {
  const sesi = await wajibLogin()
  const id = String(data.get('id') ?? '')
  if (!id) return { galat: { umum: 'Catatan tidak dikenali.' } }

  const hasil = await hapusSesi(sesi.id, id)
  if (!hasil.ok) return { galat: hasil.galat }

  segarkanHalamanSesi(id)
  redirect('/histori')
}
