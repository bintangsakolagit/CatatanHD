import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSesi } from '@catatanhd/be/services/sesi'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { TombolHapusSesi } from '@/components/sesi/tombol-hapus-sesi'
import { gayaTombol } from '@/components/ui/tombol'
import {
  formatAngka,
  formatBerat,
  formatJam,
  formatTanggal,
  formatTanggalPanjang,
  formatTensi,
  selisihBerat,
} from '@/lib/format'

export const metadata: Metadata = { title: 'Detail sesi' }

/** Detail satu sesi: semua angka dan catatan dalam satu halaman yang bisa dicetak. */
export default async function HalamanDetailSesi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sesi = await wajibLogin()
  const data = await ambilSesi(sesi.id, id)

  if (!data) notFound()

  const turun = selisihBerat(data.bb_pra_kg, data.bb_pasca_kg)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="tanpa-cetak space-y-2">
        <Link
          href="/histori"
          className="text-sm font-semibold text-muted underline underline-offset-4"
        >
          Kembali ke histori
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {formatTanggalPanjang(data.tanggal)}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Lencana>{formatDurasi(data.durasi_menit)}</Lencana>
              <span>Dicatat {formatTanggal(data.tanggal)}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/catatan/${data.id}/ubah`} className={gayaTombol('sekunder', 'sm')}>
              Ubah
            </Link>
            <TombolHapusSesi id={data.id} />
          </div>
        </div>
      </div>

      <Kartu className="p-5" cetak>
        <JudulBagian label="Ringkasan" judul="Berat dan tensi" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Statistik label="Sebelum" nilai={formatBerat(data.bb_pra_kg)} />
          <Statistik label="Sesudah" nilai={formatBerat(data.bb_pasca_kg)} />
          <Statistik
            label="Turun"
            nilai={turun === null ? '—' : formatAngka(turun, 1)}
            satuan="kg"
            keterangan={
              data.bb_kemarin_kg === null
                ? 'Berat sesi kemarin tidak dicatat'
                : `Sesi kemarin ${formatBerat(data.bb_kemarin_kg)}`
            }
          />
        </div>

        <dl className="mt-5 grid gap-4 border-t border-border/20 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Tensi sebelum
            </dt>
            <dd className="angka mt-1 text-xl font-bold">
              {formatTensi(data.tensi_pra_sistolik, data.tensi_pra_diastolik)}{' '}
              <span className="text-sm font-normal text-muted">mmHg</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Tensi akhir sesi
            </dt>
            <dd className="angka mt-1 text-xl font-bold">
              {formatTensi(data.tensi_pasca_sistolik, data.tensi_pasca_diastolik)}{' '}
              <span className="text-sm font-normal text-muted">mmHg</span>
            </dd>
          </div>
        </dl>
      </Kartu>

      <Kartu className="p-5" cetak>
        <JudulBagian
          label="Selama sesi"
          judul="Tensi berkala"
          keterangan={
            data.tensi.length === 0
              ? 'Tidak ada pemeriksaan berkala pada sesi ini.'
              : `${data.tensi.length} pemeriksaan tercatat.`
          }
        />

        {data.tensi.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="py-2 pr-3 font-semibold">Jam</th>
                  <th className="py-2 pr-3 font-semibold">Sistolik</th>
                  <th className="py-2 pr-3 font-semibold">Diastolik</th>
                  <th className="py-2 font-semibold">Nadi</th>
                </tr>
              </thead>
              <tbody>
                {data.tensi.map((baca) => (
                  <tr key={baca.id} className="border-b border-border/10 last:border-0">
                    <td className="angka py-2.5 pr-3 font-semibold">{formatJam(baca.jam)}</td>
                    <td className="angka py-2.5 pr-3">{baca.sistolik}</td>
                    <td className="angka py-2.5 pr-3">{baca.diastolik}</td>
                    <td className="angka py-2.5">{baca.nadi ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Kartu>

      <Kartu className="p-5" cetak>
        <JudulBagian label="Catatan" judul="Keluhan dan kejadian" />
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Sebelum cuci darah
            </p>
            <p className="mt-1 whitespace-pre-line">
              {data.keluhan && data.keluhan.trim() !== '' ? data.keluhan : 'Tidak ada keluhan.'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              Selama cuci darah
            </p>
            <p className="mt-1 whitespace-pre-line">
              {data.catatan && data.catatan.trim() !== ''
                ? data.catatan
                : 'Tidak ada kejadian yang dicatat.'}
            </p>
          </div>
        </div>
      </Kartu>
    </div>
  )
}
