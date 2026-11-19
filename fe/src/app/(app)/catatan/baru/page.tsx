import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSesiSebelum } from '@catatanhd/be/services/sesi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { FormSesi } from '@/components/sesi/form-sesi'
import { Ikon } from '@/components/ui/ikon'
import { Lencana } from '@/components/ui/lencana'

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
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary-kuat"
        >
          <Ikon nama="kembali" className="h-4 w-4" />
          Kembali ke beranda
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Catat sesi cuci darah</h1>
            <p className="mt-1 text-sm text-muted">
              Tiga langkah singkat: sebelum, selama, lalu setelah cuci darah.
            </p>
          </div>
          <Lencana nada="utama">Sekitar 2 menit</Lencana>
        </div>
      </div>

      <FormSesi mode="baru" bbKemarinAwal={sebelumnya?.bb_pasca_kg ?? null} />
    </div>
  )
}
