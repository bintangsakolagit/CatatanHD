import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSesi } from '@catatanhd/be/services/sesi'
import { FormSesi } from '@/components/sesi/form-sesi'

export const metadata: Metadata = { title: 'Ubah sesi' }

export default async function HalamanUbahSesi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sesi = await wajibLogin()
  const data = await ambilSesi(sesi.id, id)

  if (!data) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <Link
          href={`/catatan/${data.id}`}
          className="text-sm font-semibold text-muted underline underline-offset-4"
        >
          Kembali ke detail sesi
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Ubah catatan sesi</h1>
        <p className="text-sm text-muted">
          Perbaiki angka yang salah ketik. Perubahan langsung tersimpan setelah ditekan simpan.
        </p>
      </div>

      <FormSesi
        mode="ubah"
        id={data.id}
        awal={{
          tanggal: data.tanggal,
          durasi_menit: data.durasi_menit,
          keluhan: data.keluhan,
          bb_kemarin_kg: data.bb_kemarin_kg,
          bb_pra_kg: data.bb_pra_kg,
          bb_pasca_kg: data.bb_pasca_kg,
          tensi_pra_sistolik: data.tensi_pra_sistolik,
          tensi_pra_diastolik: data.tensi_pra_diastolik,
          tensi_pasca_sistolik: data.tensi_pasca_sistolik,
          tensi_pasca_diastolik: data.tensi_pasca_diastolik,
          catatan: data.catatan,
          tensi: data.tensi.map((baca) => ({
            jam: baca.jam,
            sistolik: baca.sistolik,
            diastolik: baca.diastolik,
            nadi: baca.nadi,
          })),
        }}
      />
    </div>
  )
}
