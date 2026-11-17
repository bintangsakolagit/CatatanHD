import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilRingkasanBeranda } from '@catatanhd/be/services/histori'
import { ambilLab } from '@catatanhd/be/services/lab'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { gayaTombol } from '@/components/ui/tombol'
import {
  formatAngka,
  formatBerat,
  formatNilaiLab,
  formatTanggal,
  formatTanggalPanjang,
  formatTensi,
  selisihBerat,
} from '@/lib/format'

export const metadata: Metadata = { title: 'Beranda' }

/** Sapaan mengikuti jam di zona Jakarta, bukan jam server. */
function sapaan(): string {
  const jam = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      hour12: false,
    }).format(new Date()),
  )
  if (jam < 11) return 'Selamat pagi'
  if (jam < 15) return 'Selamat siang'
  if (jam < 19) return 'Selamat sore'
  return 'Selamat malam'
}

export default async function HalamanBeranda() {
  const sesi = await wajibLogin()
  const [ringkasan, lab] = await Promise.all([ambilRingkasanBeranda(sesi.id), ambilLab(sesi.id)])

  const sesiTerakhir = ringkasan.sesiTerakhir
  const turun = sesiTerakhir ? selisihBerat(sesiTerakhir.bb_pra_kg, sesiTerakhir.bb_pasca_kg) : null

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {formatTanggalPanjang(tanggalJakarta())}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {sapaan()}, {sesi.profil.nama.split(' ')[0]}
        </h1>
      </div>

      {!ringkasan.sudahCatatHariIni ? (
        <Kartu className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Sesi hari ini belum dicatat</p>
            <p className="text-sm text-muted">
              Catat berat badan dan tensi sebelum pulang dari unit.
            </p>
          </div>
          <Link href="/catatan/baru" className={gayaTombol('utama')}>
            Catat sesi
          </Link>
        </Kartu>
      ) : (
        <Kartu className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Sesi hari ini sudah tercatat</p>
            <p className="text-sm text-muted">Anda masih bisa memperbaiki datanya.</p>
          </div>
          <Link href="/catatan/baru" className={gayaTombol('sekunder', 'sm')}>
            Catat sesi lain
          </Link>
        </Kartu>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Statistik
          label="Sesi bulan ini"
          nilai={ringkasan.totalBulanIni}
          satuan="sesi"
          keterangan="Sejak awal bulan"
        />
        <Statistik
          label="Rata-rata turun BB"
          nilai={
            ringkasan.rataTurunBbBulanIni === null
              ? '—'
              : formatAngka(Math.abs(ringkasan.rataTurunBbBulanIni), 1)
          }
          satuan="kg"
          keterangan="Selisih sebelum dan sesudah"
        />
        <Statistik
          label="Berat badan kering"
          nilai={formatAngka(sesi.profil.bb_kering_kg, 1)}
          satuan="kg"
          keterangan="Data profil"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="space-y-4 p-5" cetak>
          <JudulBagian
            label="Sesi terakhir"
            judul={sesiTerakhir ? formatTanggal(sesiTerakhir.tanggal) : 'Belum ada catatan'}
            aksi={
              sesiTerakhir ? <Lencana>{formatDurasi(sesiTerakhir.durasi_menit)}</Lencana> : null
            }
          />

          {sesiTerakhir ? (
            <>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted">Berat sebelum</dt>
                  <dd className="angka mt-0.5 text-lg font-bold">
                    {formatBerat(sesiTerakhir.bb_pra_kg)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Berat sesudah</dt>
                  <dd className="angka mt-0.5 text-lg font-bold">
                    {formatBerat(sesiTerakhir.bb_pasca_kg)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Tensi sebelum</dt>
                  <dd className="angka mt-0.5 font-semibold">
                    {formatTensi(sesiTerakhir.tensi_pra_sistolik, sesiTerakhir.tensi_pra_diastolik)}{' '}
                    <span className="text-xs font-normal text-muted">mmHg</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Tensi sesudah</dt>
                  <dd className="angka mt-0.5 font-semibold">
                    {formatTensi(
                      sesiTerakhir.tensi_pasca_sistolik,
                      sesiTerakhir.tensi_pasca_diastolik,
                    )}{' '}
                    <span className="text-xs font-normal text-muted">mmHg</span>
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/20 pt-3 text-sm">
                <span className="text-muted">
                  {turun === null
                    ? 'Berat sesudah belum diisi.'
                    : `Turun ${formatAngka(turun, 1)} kg selama sesi.`}
                </span>
                <Link
                  href={`/catatan/${sesiTerakhir.id}`}
                  className="font-semibold underline underline-offset-4"
                >
                  Lihat detail
                </Link>
              </div>

              {sesiTerakhir.keluhan ? (
                <p className="rounded-kontrol bg-black/[0.03] px-3 py-2 text-sm dark:bg-white/[0.05]">
                  <span className="font-semibold">Keluhan: </span>
                  {sesiTerakhir.keluhan}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">
              Catatan pertama akan muncul di sini setelah Anda menyimpan satu sesi.
            </p>
          )}
        </Kartu>

        <Kartu className="space-y-4 p-5" cetak>
          <JudulBagian
            label="Laboratorium"
            judul="Nilai terbaru"
            aksi={
              <Link href="/lab" className={gayaTombol('sekunder', 'sm')}>
                Kelola
              </Link>
            }
          />

          <ul className="divide-y divide-border/20 text-sm">
            {(['hb', 'ureum', 'kreatinin'] as const).map((jenis) => {
              const nilai = lab.terbaru[jenis]
              const label = jenis === 'hb' ? 'HB' : jenis === 'ureum' ? 'Ureum' : 'Kreatinin'
              const satuan = jenis === 'hb' ? 'g/dL' : 'mg/dL'
              const belum =
                jenis === 'hb'
                  ? !lab.status.hbBulanIni
                  : jenis === 'ureum'
                    ? !lab.status.ureumTahunIni
                    : !lab.status.kreatininTahunIni

              return (
                <li key={jenis} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-muted">
                      {nilai ? formatTanggal(nilai.tanggal) : 'Belum ada data'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="angka font-bold">
                      {nilai ? `${formatNilaiLab(nilai.nilai)} ` : '— '}
                      <span className="text-xs font-normal text-muted">{satuan}</span>
                    </p>
                    {belum ? (
                      <p className="text-[11px] font-semibold text-danger">
                        {jenis === 'hb' ? 'Belum bulan ini' : 'Belum tahun ini'}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </Kartu>
      </div>
    </div>
  )
}
