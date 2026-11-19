import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilRingkasanBeranda } from '@catatanhd/be/services/histori'
import { ambilLab } from '@catatanhd/be/services/lab'
import { formatDurasi } from '@catatanhd/be/util/durasi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { Ikon } from '@/components/ui/ikon'
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
  const namaDepan = sesi.profil.nama.split(' ')[0] ?? sesi.profil.nama

  return (
    <div className="space-y-6">
      <section className="gradien-utama relative overflow-hidden rounded-card p-5 text-white shadow-lembut sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-16 h-40 w-40 rounded-full bg-white/10"
        />

        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
            {formatTanggalPanjang(tanggalJakarta())}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {sapaan()}, {namaDepan}
          </h1>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/85">
            {ringkasan.sudahCatatHariIni
              ? 'Sesi hari ini sudah tercatat. Anda masih bisa memperbaiki datanya kapan saja.'
              : 'Catat berat badan dan tensi sesi hari ini supaya riwayat tetap lengkap.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href="/catatan/baru"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-primary-kuat shadow-lembut transition hover:bg-white/90"
            >
              <Ikon nama="tambah" className="h-4 w-4" tebal={2.4} />
              {ringkasan.sudahCatatHariIni ? 'Catat sesi lain' : 'Catat sesi hari ini'}
            </Link>
            <Link
              href="/histori"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/35 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Ikon nama="histori" className="h-4 w-4" />
              Lihat histori
            </Link>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${ringkasan.sudahCatatHariIni ? 'bg-accent' : 'bg-white'}`}
              aria-hidden="true"
            />
            {ringkasan.sudahCatatHariIni
              ? 'Sesi hari ini sudah dicatat'
              : 'Sesi hari ini belum dicatat'}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Statistik
          label="Sesi bulan ini"
          nilai={ringkasan.totalBulanIni}
          satuan="sesi"
          keterangan="Sejak awal bulan"
          nada="utama"
          ikon="kalender"
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
          nada="amber"
          ikon="timbangan"
        />
        <Statistik
          label="Berat badan kering"
          nilai={formatAngka(sesi.profil.bb_kering_kg, 1)}
          satuan="kg"
          keterangan="Data profil"
          nada="info"
          ikon="tetes"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="space-y-4 p-5" cetak>
          <JudulBagian
            label="Sesi terakhir"
            judul={sesiTerakhir ? formatTanggal(sesiTerakhir.tanggal) : 'Belum ada catatan'}
            ikon="kalender"
            aksi={
              sesiTerakhir ? (
                <Lencana nada="utama">{formatDurasi(sesiTerakhir.durasi_menit)}</Lencana>
              ) : null
            }
          />

          {sesiTerakhir ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-kontrol border border-primary/15 bg-primary-soft/70 p-3">
                  <dt className="text-xs font-semibold text-primary-kuat/75">Berat sebelum</dt>
                  <dd className="angka mt-0.5 text-lg font-bold text-primary-kuat">
                    {formatBerat(sesiTerakhir.bb_pra_kg)}
                  </dd>
                </div>
                <div className="rounded-kontrol border border-ok/20 bg-ok-soft/70 p-3">
                  <dt className="text-xs font-semibold text-ok/80">Berat sesudah</dt>
                  <dd className="angka mt-0.5 text-lg font-bold text-ok">
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

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-sm">
                <span className="text-muted">
                  {turun === null
                    ? 'Berat sesudah belum diisi.'
                    : `Turun ${formatAngka(turun, 1)} kg selama sesi.`}
                </span>
                <Link
                  href={`/catatan/${sesiTerakhir.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-primary-kuat hover:underline"
                >
                  Lihat detail
                  <Ikon nama="lanjut" className="h-3.5 w-3.5" />
                </Link>
              </div>

              {sesiTerakhir.keluhan ? (
                <p className="rounded-kontrol bg-accent-soft px-3 py-2 text-sm text-accent">
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
            ikon="lab"
            aksi={
              <Link href="/lab" className={gayaTombol('sekunder', 'sm')}>
                Kelola
              </Link>
            }
          />

          <ul className="divide-y divide-border/40 text-sm">
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
                    ) : (
                      <p className="text-[11px] font-semibold text-ok">Sudah diperiksa</p>
                    )}
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
