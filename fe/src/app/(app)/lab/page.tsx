import type { Metadata } from 'next'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilLab } from '@catatanhd/be/services/lab'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { FormHb } from '@/components/lab/form-hb'
import { FormUreumKreatinin } from '@/components/lab/form-ureum-kreatinin'
import { TombolHapusLab } from '@/components/lab/tombol-hapus-lab'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { formatNilaiLab, formatTanggal } from '@/lib/format'

export const metadata: Metadata = { title: 'Laboratorium' }

const LABEL: Record<'hb' | 'ureum' | 'kreatinin', string> = {
  hb: 'HB',
  ureum: 'Ureum',
  kreatinin: 'Kreatinin',
}

const SATUAN: Record<'hb' | 'ureum' | 'kreatinin', string> = {
  hb: 'g/dL',
  ureum: 'mg/dL',
  kreatinin: 'mg/dL',
}

export default async function HalamanLab() {
  const sesi = await wajibLogin()
  const data = await ambilLab(sesi.id)
  const hariIni = tanggalJakarta()

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Pemeriksaan penunjang
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Hasil laboratorium</h1>
        <p className="text-sm text-muted">
          HB dicatat setiap bulan, ureum dan kreatinin setiap tahun.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Lencana nada={data.status.hbBulanIni ? 'ok' : 'bahaya'}>
          HB {data.status.hbBulanIni ? 'sudah diperiksa bulan ini' : 'belum diperiksa bulan ini'}
        </Lencana>
        <Lencana
          nada={data.status.ureumTahunIni && data.status.kreatininTahunIni ? 'ok' : 'bahaya'}
        >
          Ureum & kreatinin{' '}
          {data.status.ureumTahunIni && data.status.kreatininTahunIni
            ? 'sudah diperiksa tahun ini'
            : 'belum diperiksa tahun ini'}
        </Lencana>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(['hb', 'ureum', 'kreatinin'] as const).map((jenis) => {
          const nilai = data.terbaru[jenis]
          return (
            <Statistik
              key={jenis}
              label={`${LABEL[jenis]} terbaru`}
              nilai={nilai ? formatNilaiLab(nilai.nilai) : '—'}
              satuan={nilai ? SATUAN[jenis] : undefined}
              keterangan={nilai ? formatTanggal(nilai.tanggal) : 'Belum ada data'}
            />
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="p-5">
          <FormHb tanggalHariIni={hariIni} />
        </Kartu>
        <Kartu className="p-5">
          <FormUreumKreatinin tanggalHariIni={hariIni} />
        </Kartu>
      </div>

      <Kartu className="p-5" cetak>
        <JudulBagian
          label="Riwayat"
          judul="Pemeriksaan terakhir"
          keterangan={
            data.daftar.length === 0
              ? 'Belum ada pemeriksaan yang dicatat.'
              : 'Diurutkan dari yang paling baru.'
          }
        />

        {data.daftar.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="py-2 pr-3 font-semibold">Tanggal</th>
                  <th className="py-2 pr-3 font-semibold">Pemeriksaan</th>
                  <th className="py-2 pr-3 font-semibold">Nilai</th>
                  <th className="py-2 pr-3 font-semibold">Catatan</th>
                  <th className="tanpa-cetak py-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.daftar.slice(0, 24).map((baris) => (
                  <tr key={baris.id} className="border-b border-border/10 last:border-0">
                    <td className="whitespace-nowrap py-2.5 pr-3">
                      {formatTanggal(baris.tanggal)}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold">{LABEL[baris.jenis]}</td>
                    <td className="angka py-2.5 pr-3">
                      {formatNilaiLab(baris.nilai)}{' '}
                      <span className="text-xs text-muted">{SATUAN[baris.jenis]}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{baris.catatan ?? '—'}</td>
                    <td className="tanpa-cetak py-2.5 text-right">
                      <TombolHapusLab id={baris.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Kartu>
    </div>
  )
}
