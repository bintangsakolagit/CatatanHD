import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSesiSebelum } from '@catatanhd/be/services/sesi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { FormSesi } from '@/components/sesi/form-sesi'

export const metadata: Metadata = { title: 'Catat sesi' }

export default async function HalamanCatatanBaru() {
  const sesi = await wajibLogin()
  const hariIni = tanggalJakarta()
  const sebelumnya = await ambilSesiSebelum(sesi.id, hariIni)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <Link
          href="/beranda"
          className="text-sm font-semibold text-muted underline underline-offset-4"
        >
          Kembali ke beranda
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Catat sesi cuci darah</h1>
        <p className="text-sm text-muted">
          Isi data yang tertera pada mesin dan hasil pemeriksaan petugas.
        </p>
      </div>

      <FormSesi mode="baru" bbKemarinAwal={sebelumnya?.bb_pasca_kg ?? null} />
    </div>
  )
}
