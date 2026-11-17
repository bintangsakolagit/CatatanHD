import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilHistori, normalisasiParameter } from '@catatanhd/be/services/histori'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { geserBulan, tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Tombol } from '@/components/ui/tombol'
import { TombolCetak } from '@/components/histori/tombol-cetak'
import { gayaTombol } from '@/components/ui/tombol'
import { formatAngka, formatBerat, formatTanggal, formatTensi, selisihBerat } from '@/lib/format'

export const metadata: Metadata = { title: 'Histori' }

export default async function HalamanHistori({
  searchParams,
}: {
  searchParams: Promise<{ dari?: string; sampai?: string; halaman?: string }>
}) {
  const sesi = await wajibLogin()
  const parameter = normalisasiParameter(await searchParams)
  const data = await ambilHistori(sesi.id, parameter)

  const hariIni = tanggalJakarta()
  const preset = [
    { label: '1 bulan', dari: geserBulan(hariIni, -1) },
    { label: '3 bulan', dari: geserBulan(hariIni, -3) },
    { label: '6 bulan', dari: geserBulan(hariIni, -6) },
    { label: '1 tahun', dari: geserBulan(hariIni, -12) },
  ]

  const totalHalaman = Math.max(1, Math.ceil(data.total / parameter.perHalaman))
  const buatTautan = (halaman: number) =>
    `/histori?dari=${parameter.dari}&sampai=${parameter.sampai}&halaman=${halaman}`
  const tautanEkspor = `/histori/ekspor?dari=${parameter.dari}&sampai=${parameter.sampai}`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Rangkuman
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">Histori cuci darah</h1>
          <p className="text-sm text-muted">
            {formatTanggal(parameter.dari)} — {formatTanggal(parameter.sampai)}
          </p>
        </div>
        <div className="tanpa-cetak flex flex-wrap gap-2">
          <TombolCetak />
          <a href={tautanEkspor} className={gayaTombol('sekunder', 'sm')}>
            Unduh CSV
          </a>
          <Link href="/catatan/baru" className={gayaTombol('utama', 'sm')}>
            Catat sesi
          </Link>
        </div>
      </div>

      <Kartu className="tanpa-cetak space-y-4 p-5">
        <form method="get" action="/histori" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="dari" className="block text-sm font-semibold">
              Dari
            </label>
            <input
              id="dari"
              name="dari"
              type="date"
              defaultValue={parameter.dari}
              max={hariIni}
              className="h-11 rounded-kontrol border border-border bg-surface px-3.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sampai" className="block text-sm font-semibold">
              Sampai
            </label>
            <input
              id="sampai"
              name="sampai"
              type="date"
              defaultValue={parameter.sampai}
              max={hariIni}
              className="h-11 rounded-kontrol border border-border bg-surface px-3.5 text-sm"
            />
          </div>
          <Tombol type="submit" ukuran="sm">
            Terapkan
          </Tombol>
        </form>

        <div className="flex flex-wrap gap-2">
          {preset.map((pilihan) => {
            const menyala = parameter.dari === pilihan.dari && parameter.sampai === hariIni
            return (
              <Link
                key={pilihan.label}
                href={`/histori?dari=${pilihan.dari}&sampai=${hariIni}`}
                className={
                  menyala
                    ? 'rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-on-primary'
                    : 'rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted'
                }
              >
                {pilihan.label}
              </Link>
            )
          })}
        </div>
      </Kartu>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Statistik label="Jumlah sesi" nilai={data.ringkasan.totalSesi} satuan="sesi" />
        <Statistik
          label="Rata-rata turun BB"
          nilai={
            data.ringkasan.rataTurunBb === null
              ? '—'
              : formatAngka(Math.abs(data.ringkasan.rataTurunBb), 1)
          }
          satuan="kg"
        />
        <Statistik
          label="Rata-rata tensi"
          nilai={
            data.ringkasan.rataSistolikPra === null
              ? '—'
              : formatTensi(
                  Math.round(data.ringkasan.rataSistolikPra),
                  data.ringkasan.rataDiastolikPra === null
                    ? null
                    : Math.round(data.ringkasan.rataDiastolikPra),
                )
          }
          satuan="mmHg"
          keterangan="Tensi sebelum cuci darah"
        />
        <Statistik
          label="Durasi tersering"
          nilai={
            data.ringkasan.durasiTersering === null
              ? '—'
              : formatDurasi(data.ringkasan.durasiTersering)
          }
        />
      </div>

      <div className="space-y-3">
        <JudulBagian
          judul="Daftar sesi"
          keterangan={
            data.total === 0
              ? undefined
              : `Menampilkan ${data.daftar.length} dari ${data.total} catatan.`
          }
        />

        {data.daftar.length === 0 ? (
          <Kartu className="space-y-2 p-6 text-center">
            <p className="text-sm font-semibold">Belum ada catatan di rentang ini.</p>
            <p className="text-sm text-muted">
              Ubah rentang tanggal atau catat sesi baru untuk mulai mengisi histori.
            </p>
            <Link href="/catatan/baru" className={gayaTombol('utama', 'sm', 'mt-2')}>
              Catat sesi
            </Link>
          </Kartu>
        ) : (
          <ul className="space-y-3">
            {data.daftar.map((item) => {
              const turun = selisihBerat(item.bb_pra_kg, item.bb_pasca_kg)
              return (
                <li key={item.id}>
                  <Kartu className="p-4" cetak>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-bold">{formatTanggal(item.tanggal)}</p>
                        <p className="text-xs text-muted">
                          {formatDurasi(item.durasi_menit)} · Tensi{' '}
                          {formatTensi(item.tensi_pra_sistolik, item.tensi_pra_diastolik)} →{' '}
                          {formatTensi(item.tensi_pasca_sistolik, item.tensi_pasca_diastolik)} mmHg
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="angka text-sm font-semibold">
                            {formatBerat(item.bb_pra_kg)} → {formatBerat(item.bb_pasca_kg)}
                          </p>
                          <p className="text-xs text-muted">
                            {turun === null
                              ? 'Selisih belum ada'
                              : `Turun ${formatAngka(turun, 1)} kg`}
                          </p>
                        </div>
                        {item.tensi_pasca_sistolik === null ? (
                          <Lencana nada="bahaya">Belum selesai</Lencana>
                        ) : null}
                      </div>
                    </div>

                    {item.keluhan ? (
                      <p className="mt-3 line-clamp-2 text-sm text-muted">{item.keluhan}</p>
                    ) : null}

                    <div className="tanpa-cetak mt-3 flex justify-end">
                      <Link
                        href={`/catatan/${item.id}`}
                        className="text-sm font-semibold underline underline-offset-4"
                      >
                        Lihat detail
                      </Link>
                    </div>
                  </Kartu>
                </li>
              )
            })}
          </ul>
        )}

        {totalHalaman > 1 ? (
          <div className="tanpa-cetak flex items-center justify-between pt-2 text-sm">
            {parameter.halaman > 1 ? (
              <Link
                href={buatTautan(parameter.halaman - 1)}
                className="font-semibold underline underline-offset-4"
              >
                Sebelumnya
              </Link>
            ) : (
              <span className="text-muted">Awal</span>
            )}
            <span className="angka text-muted">
              Halaman {parameter.halaman} dari {totalHalaman}
            </span>
            {parameter.halaman < totalHalaman ? (
              <Link
                href={buatTautan(parameter.halaman + 1)}
                className="font-semibold underline underline-offset-4"
              >
                Berikutnya
              </Link>
            ) : (
              <span className="text-muted">Akhir</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
