'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { aksiSimpanSesi, aksiUbahSesi } from '@/actions/sesi'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom, Pilihan, AreaTeks } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'
import { DAFTAR_DURASI, formatDurasi } from '@catatanhd/be/util/durasi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { formatJam } from '@/lib/format'

/**
 * Formulir satu sesi cuci darah.
 * Tensi berkala disimpan sebagai state lokal, lalu dikirim sebagai JSON pada
 * satu input tersembunyi. Cara ini menjaga formulir tetap satu request tanpa
 * membuat puluhan nama field dinamis.
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

  const [barisTensi, setBarisTensi] = useState<BarisTensi[]>(
    awal?.tensi.map((t) => ({
      jam: formatJam(t.jam),
      sistolik: String(t.sistolik),
      diastolik: String(t.diastolik),
      nadi: t.nadi === null ? '' : String(t.nadi),
    })) ?? [],
  )

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

  return (
    <form action={kirim} className="space-y-5" noValidate>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="tensi" value={JSON.stringify(barisTensi)} />

      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted">Waktu sesi</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Kolom label="Tanggal cuci darah" htmlFor="tanggal" galat={status.galat?.tanggal}>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              max={tanggalJakarta()}
              defaultValue={awal?.tanggal ?? tanggalJakarta()}
              required
            />
          </Kolom>

          <Kolom label="Lama cuci darah" htmlFor="durasi_menit" galat={status.galat?.durasi_menit}>
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
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted">Berat badan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Kolom
            label="Sesi kemarin"
            htmlFor="bb_kemarin_kg"
            petunjuk="Terisi otomatis, boleh diubah."
            galat={status.galat?.bb_kemarin_kg}
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

          <Kolom label="Sebelum cuci" htmlFor="bb_pra_kg" galat={status.galat?.bb_pra_kg}>
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

          <Kolom label="Setelah cuci" htmlFor="bb_pasca_kg" galat={status.galat?.bb_pasca_kg}>
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
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted">Tensi</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold">Sebelum cuci darah</p>
            <div className="grid grid-cols-2 gap-3">
              <Kolom
                label="Sistolik"
                htmlFor="tensi_pra_sistolik"
                galat={status.galat?.tensi_pra_sistolik}
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
                label="Diastolik"
                htmlFor="tensi_pra_diastolik"
                galat={status.galat?.tensi_pra_diastolik}
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

          <div className="space-y-3">
            <p className="text-sm font-semibold">Akhir sesi</p>
            <div className="grid grid-cols-2 gap-3">
              <Kolom
                label="Sistolik"
                htmlFor="tensi_pasca_sistolik"
                galat={status.galat?.tensi_pasca_sistolik}
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
                galat={status.galat?.tensi_pasca_diastolik}
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
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted">
              Tensi selama cuci darah
            </h2>
            <p className="mt-1 text-xs text-muted">
              Isi bila ada pemeriksaan berkala. Kosongkan jika tidak ada.
            </p>
          </div>
          <Tombol type="button" varian="sekunder" ukuran="sm" onClick={tambahBaris}>
            Tambah baris
          </Tombol>
        </div>

        {barisTensi.length === 0 ? (
          <p className="mt-4 rounded-kontrol border border-dashed border-border/40 px-4 py-6 text-center text-sm text-muted">
            Belum ada pemeriksaan berkala.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {barisTensi.map((baris, indeks) => (
              <li
                key={indeks}
                className="grid grid-cols-2 gap-3 rounded-kontrol border border-border/30 p-3 sm:grid-cols-[7rem_1fr_1fr_1fr_auto] sm:items-end sm:border-0 sm:p-0"
              >
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
                <Tombol
                  type="button"
                  varian="bahaya"
                  ukuran="sm"
                  className="col-span-2 sm:col-span-1"
                  onClick={() => hapusBaris(indeks)}
                >
                  Hapus
                </Tombol>
              </li>
            ))}
          </ul>
        )}

        {status.galat?.tensi ? (
          <p className="mt-3 text-xs font-medium text-danger">{status.galat.tensi}</p>
        ) : null}
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-muted">Catatan</h2>
        <div className="mt-4 space-y-4">
          <Kolom label="Keluhan sebelum cuci darah" htmlFor="keluhan" galat={status.galat?.keluhan}>
            <AreaTeks
              id="keluhan"
              name="keluhan"
              rows={2}
              placeholder="Contoh: sesak ringan, mual sejak semalam"
              defaultValue={awal?.keluhan ?? ''}
            />
          </Kolom>

          <Kolom
            label="Kejadian selama cuci darah"
            htmlFor="catatan"
            petunjuk="Catat hal yang dirasakan, misalnya kram, pusing, atau menggigil."
            galat={status.galat?.catatan}
          >
            <AreaTeks
              id="catatan"
              name="catatan"
              rows={3}
              placeholder="Contoh: kram kaki kanan menit ke-90, tensi turun ke 90/60"
              defaultValue={awal?.catatan ?? ''}
            />
          </Kolom>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <a
          href={id ? `/catatan/${id}` : '/beranda'}
          className="inline-flex h-11 items-center justify-center rounded-kontrol border border-border bg-surface px-4 text-sm font-semibold"
        >
          Batal
        </a>
        <Tombol type="submit" disabled={sedang}>
          {sedang ? 'Menyimpan…' : mode === 'baru' ? 'Simpan catatan' : 'Simpan perubahan'}
        </Tombol>
      </div>
    </form>
  )
}
