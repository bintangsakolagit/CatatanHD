import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSesi } from '@catatanhd/be/services/sesi'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { Ikon } from '@/components/ui/ikon'
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

/**
 * Detail satu sesi disusun mengikuti urutan kejadian: sebelum, selama, lalu
 * setelah cuci darah. Urutan ini sama dengan formulir agar mudah dicocokkan.
 */
export default async function HalamanDetailSesi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sesi = await wajibLogin()
  const data = await ambilSesi(sesi.id, id)

  if (!data) notFound()

  const turun = selisihBerat(data.bb_pra_kg, data.bb_pasca_kg)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="tanpa-cetak space-y-3">
        <Link
          href="/histori"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary-kuat"
        >
          <Ikon nama="kembali" className="h-4 w-4" />
          Kembali ke histori
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {formatTanggalPanjang(data.tanggal)}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Lencana nada="utama">{formatDurasi(data.durasi_menit)}</Lencana>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Statistik
          label="Berat sebelum"
          nilai={formatBerat(data.bb_pra_kg)}
          nada="utama"
          ikon="timbangan"
        />
        <Statistik
          label="Berat sesudah"
          nilai={formatBerat(data.bb_pasca_kg)}
          nada="info"
          ikon="timbangan"
        />
        <Statistik
          label="Turun selama sesi"
          nilai={turun === null ? '—' : formatAngka(turun, 1)}
          satuan={turun === null ? undefined : 'kg'}
          keterangan={
            data.bb_kemarin_kg === null
              ? 'Berat sesi kemarin tidak dicatat'
              : `Sesi kemarin ${formatBerat(data.bb_kemarin_kg)}`
          }
          nada="amber"
          ikon="tetes"
        />
      </div>

      <Kartu className="p-5" cetak>
        <JudulBagian
          label="Sebelum"
          judul="Sebelum cuci darah"
          ikon="timbangan"
          keterangan="Data saat baru tiba di unit."
        />

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-kontrol border border-primary/15 bg-primary-soft/60 p-4">
            <dt className="text-xs font-semibold text-primary-kuat/75">Berat badan</dt>
            <dd className="angka mt-1 text-xl font-bold text-primary-kuat">
              {formatBerat(data.bb_pra_kg)}
            </dd>
          </div>
          <div className="rounded-kontrol border border-info/20 bg-info-soft/60 p-4">
            <dt className="text-xs font-semibold text-info/80">Tensi</dt>
            <dd className="angka mt-1 text-xl font-bold text-info">
              {formatTensi(data.tensi_pra_sistolik, data.tensi_pra_diastolik)}{' '}
              <span className="text-sm font-normal text-muted">mmHg</span>
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Keluhan</p>
          <p className="mt-1 whitespace-pre-line text-sm">
            {data.keluhan && data.keluhan.trim() !== '' ? data.keluhan : 'Tidak ada keluhan.'}
          </p>
        </div>
      </Kartu>

      <Kartu className="p-5" cetak>
        <JudulBagian
          label="Selama"
          judul="Selama cuci darah"
          ikon="jantung"
          keterangan={
            data.tensi.length === 0
              ? 'Tidak ada pemeriksaan tensi berkala pada sesi ini.'
              : `${data.tensi.length} pemeriksaan tensi tercatat.`
          }
        />

        {data.tensi.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="py-2 pr-3 font-semibold">Jam</th>
                  <th className="py-2 pr-3 font-semibold">Sistolik</th>
                  <th className="py-2 pr-3 font-semibold">Diastolik</th>
                  <th className="py-2 font-semibold">Nadi</th>
                </tr>
              </thead>
              <tbody>
                {data.tensi.map((baca) => (
                  <tr key={baca.id} className="border-b border-border/40 last:border-0">
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

        <div className="mt-4 rounded-kontrol bg-accent-soft/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">Kejadian</p>
          <p className="mt-1 whitespace-pre-line text-sm text-text">
            {data.catatan && data.catatan.trim() !== ''
              ? data.catatan
              : 'Tidak ada kejadian yang dicatat.'}
          </p>
        </div>
      </Kartu>

      <Kartu className="p-5" cetak>
        <JudulBagian
          label="Setelah"
          judul="Setelah cuci darah"
          ikon="periksa"
          keterangan="Data sebelum pulang dari unit."
        />

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-kontrol border border-ok/20 bg-ok-soft/60 p-4">
            <dt className="text-xs font-semibold text-ok/80">Berat badan</dt>
            <dd className="angka mt-1 text-xl font-bold text-ok">
              {formatBerat(data.bb_pasca_kg)}
            </dd>
          </div>
          <div className="rounded-kontrol border border-ok/20 bg-ok-soft/60 p-4">
            <dt className="text-xs font-semibold text-ok/80">Tensi akhir sesi</dt>
            <dd className="angka mt-1 text-xl font-bold text-ok">
              {formatTensi(data.tensi_pasca_sistolik, data.tensi_pasca_diastolik)}{' '}
              <span className="text-sm font-normal text-muted">mmHg</span>
            </dd>
          </div>
        </dl>

        {turun !== null ? (
          <p className="mt-4 rounded-kontrol bg-surface-2 px-4 py-3 text-sm text-muted">
            Cairan berkurang <span className="font-bold text-text">{formatAngka(turun, 1)} kg</span>{' '}
            selama sesi ini.
          </p>
        ) : null}
      </Kartu>
    </div>
  )
}
