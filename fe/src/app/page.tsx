import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ambilSesi } from '@catatanhd/be/auth/sesi'

export const metadata: Metadata = { title: 'Masuk' }

export default async function HalamanAwal() {
  const sesi = await ambilSesi()
  redirect(sesi ? '/beranda' : '/masuk')
}
