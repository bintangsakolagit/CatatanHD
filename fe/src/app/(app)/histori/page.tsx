import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilHistori, normalisasiParameter } from '@catatanhd/be/services/histori'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { geserBulan, tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { Ikon } from '@/components/ui/ikon'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Tombol } from '@/components/ui/tombol'
import { TombolCetak } from '@/components/histori/tombol-cetak'
import { gayaTombol } from '@/components/ui/tombol'
import { formatAngka, formatBerat, formatTanggal, formatTensi, selisihBerat } from '@/lib/format'

export const metadata: Metadata = { title: 'Histori' }

const gayaTanggal =
  'h-11 rounded-kontrol border border-border bg-surface px-3.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15'

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
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            <Ikon nama="histori" className="h-3.5 w-3.5" tebal={2.2} />
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
            <Ikon nama="unduh" className="h-4 w-4" />
            Unduh CSV
          </a>
          <Link href="/catatan/baru" className={gayaTombol('utama', 'sm')}>
            <Ikon nama="tambah" className="h-4 w-4" />
            Catat sesi
          </Link>
        </div>
      </div>

      <Kartu className="tanpa-cetak space-y-4 p-5">
        <form method="get" action="/histori" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="dari" className="block text-[13px] font-semibold">
              Dari
            </label>
            <input
              id="dari"
              name="dari"
              type="date"
              defaultValue={parameter.dari}
              max={hariIni}
              className={gayaTanggal}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sampai" className="block text-[13px] font-semibold">
              Sampai
            </label>
            <input
              id="sampai"
              name="sampai"
              type="date"
              defaultValue={parameter.sampai}
              max={hariIni}
              className={gayaTanggal}
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
                    ? 'rounded-full border border-primary/40 bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary-kuat'
                    : 'rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted transition hover:border-primary/40 hover:text-primary-kuat'
                }
              >
                {pilihan.label}
              </Link>
            )
          })}
        </div>
      </Kartu>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Statistik
          label="Jumlah sesi"
          nilai={data.ringkasan.totalSesi}
          satuan="sesi"
          nada="utama"
          ikon="kalender"
        />
        <Statistik
          label="Rata-rata turun BB"
          nilai={
            data.ringkasan.rataTurunBb === null
              ? '—'
              : formatAngka(Math.abs(data.ringkasan.rataTurunBb), 1)
          }
          satuan="kg"
          nada="amber"
          ikon="timbangan"
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
          nada="info"
          ikon="jantung"
        />
        <Statistik
          label="Durasi tersering"
          nilai={
            data.ringkasan.durasiTersering === null
              ? '—'
              : formatDurasi(data.ringkasan.durasiTersering)
          }
          nada="lila"
          ikon="jam"
        />
      </div>

      <div className="space-y-3">
        <JudulBagian
          label="Daftar"
          judul="Sesi tercatat"
          ikon="catatan"
          keterangan={
            data.total === 0
              ? undefined
              : `Menampilkan ${data.daftar.length} dari ${data.total} catatan.`
          }
        />

        {data.daftar.length === 0 ? (
          <Kartu className="space-y-2 p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-kuat">
              <Ikon nama="kalender" className="h-6 w-6" />
            </span>
            <p className="pt-1 text-sm font-semibold">Belum ada catatan di rentang ini.</p>
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
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-kontrol bg-primary-soft text-primary-kuat sm:flex">
                          <Ikon nama="kalender" className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold">{formatTanggal(item.tanggal)}</p>
                          <p className="text-xs text-muted">
                            {formatDurasi(item.durasi_menit)} · Tensi{' '}
                            {formatTensi(item.tensi_pra_sistolik, item.tensi_pra_diastolik)} →{' '}
                            {formatTensi(item.tensi_pasca_sistolik, item.tensi_pasca_diastolik)}{' '}
                            mmHg
                          </p>
                        </div>
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
                          <Lencana nada="amber">Belum selesai</Lencana>
                        ) : (
                          <Lencana nada="ok">Lengkap</Lencana>
                        )}
                      </div>
                    </div>

                    {item.keluhan ? (
                      <p className="mt-3 line-clamp-2 rounded-kontrol bg-accent-soft/70 px-3 py-2 text-sm text-accent">
                        {item.keluhan}
                      </p>
                    ) : null}

                    <div className="tanpa-cetak mt-3 flex justify-end">
                      <Link
                        href={`/catatan/${item.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-kuat hover:underline"
                      >
                        Lihat detail
                        <Ikon nama="lanjut" className="h-3.5 w-3.5" />
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
                className="font-semibold text-primary-kuat underline underline-offset-4"
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
                className="font-semibold text-primary-kuat underline underline-offset-4"
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
