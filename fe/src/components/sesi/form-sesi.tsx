'use client'

import { useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { aksiSimpanSesi, aksiUbahSesi } from '@/actions/sesi'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom, Pilihan, AreaTeks } from '@/components/ui/kolom'
import { Ikon } from '@/components/ui/ikon'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'
import {
  TAHAP_SESI,
  periksaTahap,
  tahapUntukGalat,
  type GalatLokal,
  type NilaiSesi,
  type NomorTahap,
} from '@/lib/tahap-sesi'
import { DAFTAR_DURASI, formatDurasi } from '@catatanhd/be/util/durasi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { formatJam } from '@/lib/format'

/**
 * Formulir satu sesi cuci darah dalam tiga tahap: sebelum, selama, dan setelah.
 *
 * Semua bagian tetap terpasang di DOM dan hanya disembunyikan, sehingga isian
 * tidak hilang saat pasien berpindah tahap. Tensi berkala disimpan sebagai state
 * lokal lalu dikirim sebagai JSON pada satu input tersembunyi.
 */

export interface BarisTensi {
  jam: string
  sistolik: string
  diastolik: string
  nadi: string
}

export interface AwalSesi {
  tanggal: string
  durasi_menit: number
  keluhan: string | null
  bb_kemarin_kg: number | null
  bb_pra_kg: number
  bb_pasca_kg: number | null
  tensi_pra_sistolik: number
  tensi_pra_diastolik: number
  tensi_pasca_sistolik: number | null
  tensi_pasca_diastolik: number | null
  catatan: string | null
  tensi: Array<{ jam: string; sistolik: number; diastolik: number; nadi: number | null }>
}

function jamSekarang(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

/** Kolom yang difokuskan saat validasi tahap gagal. */
const ID_FOKUS: Record<string, string> = {
  tanggal: 'tanggal',
  durasi_menit: 'durasi_menit',
  bb_kemarin_kg: 'bb_kemarin_kg',
  bb_pra_kg: 'bb_pra_kg',
  tensi_pra_sistolik: 'tensi_pra_sistolik',
  tensi_pra_diastolik: 'tensi_pra_diastolik',
  tensi: 'tensi-tambah',
  bb_pasca_kg: 'bb_pasca_kg',
  tensi_pasca_sistolik: 'tensi_pasca_sistolik',
  tensi_pasca_diastolik: 'tensi_pasca_diastolik',
}

export function FormSesi({
  mode,
  id,
  bbKemarinAwal,
  awal,
}: {
  mode: 'baru' | 'ubah'
  id?: string
  bbKemarinAwal?: number | null
  awal?: AwalSesi
}) {
  const aksi = mode === 'baru' ? aksiSimpanSesi : aksiUbahSesi
  const [status, kirim, sedang] = useActionState<StatusForm, FormData>(aksi, STATUS_AWAL)

  const formulir = useRef<HTMLFormElement>(null)
  const [tahap, setTahap] = useState<NomorTahap>(1)
  const [tahapTerbuka, setTahapTerbuka] = useState<NomorTahap>(1)
  const [galatLokal, setGalatLokal] = useState<GalatLokal>({})

  const [barisTensi, setBarisTensi] = useState<BarisTensi[]>(
    awal?.tensi.map((t) => ({
      jam: formatJam(t.jam),
      sistolik: String(t.sistolik),
      diastolik: String(t.diastolik),
      nadi: t.nadi === null ? '' : String(t.nadi),
    })) ?? [],
  )

  // Galat dari server bisa berasal dari tahap lain; buka tahap tersebut agar
  // pasien langsung melihat kolom yang perlu diperbaiki.
  useEffect(() => {
    const tujuan = tahapUntukGalat(status.galat)
    if (!tujuan) return
    setTahap(tujuan)
    setTahapTerbuka((kini) => (tujuan > kini ? tujuan : kini))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [status])

  const tahapAktif = TAHAP_SESI.find((item) => item.nomor === tahap) ?? TAHAP_SESI[0]!

  function ubahBaris(indeks: number, kolom: keyof BarisTensi, nilai: string) {
    setBarisTensi((sebelum) =>
      sebelum.map((baris, i) => (i === indeks ? { ...baris, [kolom]: nilai } : baris)),
    )
  }

  function tambahBaris() {
    setBarisTensi((sebelum) => [
      ...sebelum,
      { jam: jamSekarang(), sistolik: '', diastolik: '', nadi: '' },
    ])
  }

  function hapusBaris(indeks: number) {
    setBarisTensi((sebelum) => sebelum.filter((_, i) => i !== indeks))
  }

  function nilaiFormulir(): NilaiSesi {
    const data = new FormData(formulir.current ?? undefined)
    const teks = (kunci: string) => String(data.get(kunci) ?? '')

    return {
      tanggal: teks('tanggal'),
      durasi_menit: teks('durasi_menit'),
      keluhan: teks('keluhan'),
      bb_kemarin_kg: teks('bb_kemarin_kg'),
      bb_pra_kg: teks('bb_pra_kg'),
      bb_pasca_kg: teks('bb_pasca_kg'),
      tensi_pra_sistolik: teks('tensi_pra_sistolik'),
      tensi_pra_diastolik: teks('tensi_pra_diastolik'),
      tensi_pasca_sistolik: teks('tensi_pasca_sistolik'),
      tensi_pasca_diastolik: teks('tensi_pasca_diastolik'),
      catatan: teks('catatan'),
      tensi: barisTensi,
    }
  }

  function lanjut() {
    const hasil = periksaTahap(tahap, nilaiFormulir())
    setGalatLokal(hasil)

    const kunciPertama = Object.keys(hasil)[0]
    if (kunciPertama) {
      const idFokus = ID_FOKUS[kunciPertama]
      if (idFokus) document.getElementById(idFokus)?.focus()
      return
    }

    if (tahap < 3) {
      const berikut = (tahap + 1) as NomorTahap
      setTahap(berikut)
      setTahapTerbuka((kini) => (berikut > kini ? berikut : kini))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function kembali() {
    if (tahap > 1) setTahap((tahap - 1) as NomorTahap)
  }

  function pindahTahap(tujuan: NomorTahap) {
    if (tujuan <= tahapTerbuka) setTahap(tujuan)
  }

  /** Galat server pada baris tensi berkala memakai kunci "tensi.0.sistolik". */
  const galatTensiServer = Object.entries(status.galat ?? {}).find(
    ([kunci]) => kunci === 'tensi' || kunci.startsWith('tensi.'),
  )?.[1]

  const galat = (kunci: string) => galatLokal[kunci] ?? status.galat?.[kunci]

  const adaGalatServer = Object.keys(status.galat ?? {}).some((kunci) => kunci !== 'umum')

  return (
    <form
      ref={formulir}
      action={kirim}
      className="scroll-mt-24 space-y-5"
      noValidate
      onKeyDown={(event) => {
        // Enter di kolom teks tidak boleh mengirim formulir sebelum tahap akhir.
        if (event.key === 'Enter' && event.target instanceof HTMLElement) {
          if (event.target.tagName !== 'TEXTAREA') event.preventDefault()
        }
      }}
    >
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="tensi" value={JSON.stringify(barisTensi)} />

      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <div className="rounded-card border border-border/80 bg-surface p-4 shadow-lembut sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Langkah {tahap} dari 3
          </p>
          <p className="text-xs font-medium text-muted">{tahapAktif.pendek}</p>
        </div>

        <ol className="mt-3 grid grid-cols-3 gap-2" aria-label="Tahap pengisian">
          {TAHAP_SESI.map((item) => {
            const aktif = item.nomor === tahap
            const selesai = item.nomor < tahap
            const terbuka = item.nomor <= tahapTerbuka
            return (
              <li key={item.nomor}>
                <button
                  type="button"
                  onClick={() => pindahTahap(item.nomor)}
                  disabled={!terbuka}
                  aria-current={aktif ? 'step' : undefined}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-kontrol border px-1 py-2.5 text-[11px] font-semibold transition sm:text-xs ${
                    aktif
                      ? 'border-primary/40 bg-primary-soft text-primary-kuat'
                      : selesai
                        ? 'border-ok/30 bg-ok-soft text-ok'
                        : terbuka
                          ? 'border-border bg-surface text-muted hover:border-primary/30'
                          : 'cursor-not-allowed border-border/60 bg-surface text-muted/50'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      aktif
                        ? 'bg-primary text-on-primary'
                        : selesai
                          ? 'bg-ok text-white'
                          : 'bg-surface-2 text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {selesai ? (
                      <Ikon nama="periksa" className="h-3.5 w-3.5" tebal={2.6} />
                    ) : (
                      item.nomor
                    )}
                  </span>
                  {item.pendek}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div
            className="gradien-utama h-full rounded-full transition-all duration-300"
            style={{ width: `${(tahap / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="gradien-tetes flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lembut">
          <Ikon nama={tahap === 1 ? 'timbangan' : tahap === 2 ? 'jantung' : 'periksa'} />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight">{tahapAktif.judul}</h2>
          <p className="text-sm text-muted">{tahapAktif.keterangan}</p>
        </div>
      </div>

      {adaGalatServer ? (
        <Peringatan jenis="galat" judul="Ada isian yang perlu diperbaiki">
          Periksa kembali kolom yang ditandai, lalu simpan lagi.
        </Peringatan>
      ) : null}

      {/* Tahap 1: sebelum cuci darah */}
      <section
        hidden={tahap !== 1}
        aria-labelledby="judul-tahap-1"
        className="rounded-card border border-border/80 bg-surface p-5 shadow-lembut"
      >
        <h3 id="judul-tahap-1" className="sr-only">
          Data sebelum cuci darah
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Kolom label="Tanggal cuci darah" htmlFor="tanggal" galat={galat('tanggal')}>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              max={tanggalJakarta()}
              defaultValue={awal?.tanggal ?? tanggalJakarta()}
              required
            />
          </Kolom>

          <Kolom label="Lama cuci darah" htmlFor="durasi_menit" galat={galat('durasi_menit')}>
            <Pilihan
              id="durasi_menit"
              name="durasi_menit"
              defaultValue={String(awal?.durasi_menit ?? 300)}
              required
            >
              {DAFTAR_DURASI.map((menit) => (
                <option key={menit} value={menit}>
                  {formatDurasi(menit)}
                </option>
              ))}
            </Pilihan>
          </Kolom>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Kolom
            label="Berat badan sebelum cuci"
            htmlFor="bb_pra_kg"
            petunjuk="Angka pada timbangan saat baru tiba."
            galat={galat('bb_pra_kg')}
          >
            <Input
              id="bb_pra_kg"
              name="bb_pra_kg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="250"
              placeholder="63.5"
              defaultValue={awal?.bb_pra_kg ?? ''}
              required
            />
          </Kolom>

          <Kolom
            label="Berat badan sesi kemarin"
            htmlFor="bb_kemarin_kg"
            petunjuk="Terisi otomatis, boleh diubah."
            galat={galat('bb_kemarin_kg')}
          >
            <Input
              id="bb_kemarin_kg"
              name="bb_kemarin_kg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="250"
              placeholder="62.0"
              defaultValue={awal?.bb_kemarin_kg ?? bbKemarinAwal ?? ''}
            />
          </Kolom>
        </div>

        <div className="mt-5 rounded-kontrol border border-info/20 bg-info-soft/60 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-info">
            <Ikon nama="jantung" className="h-4 w-4" />
            Tensi sebelum cuci darah
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Kolom
              label="Sistolik (atas)"
              htmlFor="tensi_pra_sistolik"
              galat={galat('tensi_pra_sistolik')}
            >
              <Input
                id="tensi_pra_sistolik"
                name="tensi_pra_sistolik"
                type="number"
                inputMode="numeric"
                min="50"
                max="300"
                placeholder="150"
                defaultValue={awal?.tensi_pra_sistolik ?? ''}
                required
              />
            </Kolom>
            <Kolom
              label="Diastolik (bawah)"
              htmlFor="tensi_pra_diastolik"
              galat={galat('tensi_pra_diastolik')}
            >
              <Input
                id="tensi_pra_diastolik"
                name="tensi_pra_diastolik"
                type="number"
                inputMode="numeric"
                min="30"
                max="200"
                placeholder="90"
                defaultValue={awal?.tensi_pra_diastolik ?? ''}
                required
              />
            </Kolom>
          </div>
        </div>

        <div className="mt-5">
          <Kolom
            label="Keluhan sebelum cuci darah"
            htmlFor="keluhan"
            petunjuk="Boleh dikosongkan bila tidak ada keluhan."
            galat={galat('keluhan')}
          >
            <AreaTeks
              id="keluhan"
              name="keluhan"
              rows={2}
              placeholder="Contoh: sesak ringan, mual sejak semalam"
              defaultValue={awal?.keluhan ?? ''}
            />
          </Kolom>
        </div>
      </section>

      {/* Tahap 2: selama cuci darah */}
      <section hidden={tahap !== 2} aria-labelledby="judul-tahap-2" className="space-y-4">
        <h3 id="judul-tahap-2" className="sr-only">
          Data selama cuci darah
        </h3>

        <div className="rounded-card border border-border/80 bg-surface p-5 shadow-lembut">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold">
                <Ikon nama="jam" className="h-4 w-4 text-primary" />
                Tensi berkala
              </p>
              <p className="mt-1 text-xs text-muted">
                Catat setiap kali petugas memeriksa tensi. Boleh dilewati.
              </p>
            </div>
            <Tombol
              id="tensi-tambah"
              type="button"
              varian="sekunder"
              ukuran="sm"
              onClick={tambahBaris}
            >
              <Ikon nama="tambah" className="h-4 w-4" />
              Tambah pemeriksaan
            </Tombol>
          </div>

          {barisTensi.length === 0 ? (
            <div className="mt-4 rounded-kontrol border border-dashed border-border px-4 py-7 text-center">
              <p className="text-sm font-semibold">Belum ada pemeriksaan berkala.</p>
              <p className="mt-1 text-sm text-muted">
                Tekan tombol tambah bila petugas mengukur tensi di tengah sesi.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {barisTensi.map((baris, indeks) => (
                <li key={indeks} className="rounded-kontrol border border-border/70 bg-bg/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                      Pemeriksaan {indeks + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => hapusBaris(indeks)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                    >
                      <Ikon nama="hapus" className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Kolom label="Jam" htmlFor={`jam-${indeks}`}>
                      <Input
                        id={`jam-${indeks}`}
                        type="time"
                        value={baris.jam}
                        onChange={(e) => ubahBaris(indeks, 'jam', e.target.value)}
                      />
                    </Kolom>
                    <Kolom label="Sistolik" htmlFor={`sis-${indeks}`}>
                      <Input
                        id={`sis-${indeks}`}
                        type="number"
                        inputMode="numeric"
                        min="50"
                        max="300"
                        value={baris.sistolik}
                        onChange={(e) => ubahBaris(indeks, 'sistolik', e.target.value)}
                      />
                    </Kolom>
                    <Kolom label="Diastolik" htmlFor={`dia-${indeks}`}>
                      <Input
                        id={`dia-${indeks}`}
                        type="number"
                        inputMode="numeric"
                        min="30"
                        max="200"
                        value={baris.diastolik}
                        onChange={(e) => ubahBaris(indeks, 'diastolik', e.target.value)}
                      />
                    </Kolom>
                    <Kolom label="Nadi" htmlFor={`nadi-${indeks}`}>
                      <Input
                        id={`nadi-${indeks}`}
                        type="number"
                        inputMode="numeric"
                        min="20"
                        max="250"
                        value={baris.nadi}
                        onChange={(e) => ubahBaris(indeks, 'nadi', e.target.value)}
                      />
                    </Kolom>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {(galat('tensi') ?? galatTensiServer) ? (
            <p className="mt-3 text-xs font-semibold text-danger" role="alert">
              {galat('tensi') ?? galatTensiServer}
            </p>
          ) : null}
        </div>

        <div className="rounded-card border border-border/80 bg-surface p-5 shadow-lembut">
          <Kolom
            label="Kejadian selama cuci darah"
            htmlFor="catatan"
            petunjuk="Misalnya kram, pusing, menggigil, atau tensi yang turun."
            galat={galat('catatan')}
          >
            <AreaTeks
              id="catatan"
              name="catatan"
              rows={4}
              placeholder="Contoh: kram kaki kanan menit ke-90, tensi turun ke 90/60"
              defaultValue={awal?.catatan ?? ''}
            />
          </Kolom>
        </div>
      </section>

      {/* Tahap 3: setelah cuci darah */}
      <section hidden={tahap !== 3} aria-labelledby="judul-tahap-3" className="space-y-4">
        <h3 id="judul-tahap-3" className="sr-only">
          Data setelah cuci darah
        </h3>

        <div className="rounded-card border border-border/80 bg-surface p-5 shadow-lembut">
          <div className="grid gap-4 sm:grid-cols-2">
            <Kolom
              label="Berat badan setelah cuci"
              htmlFor="bb_pasca_kg"
              petunjuk="Timbang sebelum pulang."
              galat={galat('bb_pasca_kg')}
            >
              <Input
                id="bb_pasca_kg"
                name="bb_pasca_kg"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="20"
                max="250"
                placeholder="60.8"
                defaultValue={awal?.bb_pasca_kg ?? ''}
              />
            </Kolom>

            <div className="rounded-kontrol border border-ok/20 bg-ok-soft/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ok">
                <Ikon nama="jantung" className="h-4 w-4" />
                Tensi akhir sesi
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Kolom
                  label="Sistolik"
                  htmlFor="tensi_pasca_sistolik"
                  galat={galat('tensi_pasca_sistolik')}
                >
                  <Input
                    id="tensi_pasca_sistolik"
                    name="tensi_pasca_sistolik"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max="300"
                    placeholder="130"
                    defaultValue={awal?.tensi_pasca_sistolik ?? ''}
                  />
                </Kolom>
                <Kolom
                  label="Diastolik"
                  htmlFor="tensi_pasca_diastolik"
                  galat={galat('tensi_pasca_diastolik')}
                >
                  <Input
                    id="tensi_pasca_diastolik"
                    name="tensi_pasca_diastolik"
                    type="number"
                    inputMode="numeric"
                    min="30"
                    max="200"
                    placeholder="80"
                    defaultValue={awal?.tensi_pasca_diastolik ?? ''}
                  />
                </Kolom>
              </div>
            </div>
          </div>

          <p className="mt-4 rounded-kontrol bg-surface-2 px-4 py-3 text-sm text-muted">
            Data setelah cuci boleh dikosongkan bila pemeriksaan belum dilakukan. Anda tetap bisa
            mengubah catatan ini nanti.
          </p>
        </div>

        <div className="rounded-card border border-primary/20 bg-primary-soft/60 p-4 text-sm text-primary-kuat">
          <p className="flex items-center gap-2 font-bold">
            <Ikon nama="perisai" className="h-4 w-4" />
            Sebelum menyimpan
          </p>
          <p className="mt-1 leading-relaxed">
            Pastikan tanggal, berat badan, dan tensi sudah sesuai dengan yang tertera di unit. Tekan
            tombol simpan satu kali saja.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {tahap > 1 ? (
          <Tombol type="button" varian="sekunder" onClick={kembali}>
            <Ikon nama="kembali" className="h-4 w-4" />
            Kembali
          </Tombol>
        ) : (
          <a
            href={id ? `/catatan/${id}` : '/beranda'}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-kontrol px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
          >
            Batal
          </a>
        )}

        {tahap < 3 ? (
          <Tombol key="lanjut" type="button" onClick={lanjut} className="sm:min-w-40">
            Lanjut
            <Ikon nama="lanjut" className="h-4 w-4" />
          </Tombol>
        ) : (
          <Tombol key="simpan" type="submit" disabled={sedang} className="sm:min-w-52">
            {sedang ? 'Menyimpan…' : mode === 'baru' ? 'Simpan catatan' : 'Simpan perubahan'}
            {sedang ? null : <Ikon nama="periksa" className="h-4 w-4" />}
          </Tombol>
        )}
      </div>
    </form>
  )
}
