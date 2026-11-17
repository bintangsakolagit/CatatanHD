'use client'

import { useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { aksiSimpanUreumKreatinin } from '@/actions/lab'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'

/** Ureum dan kreatinin berasal dari satu sampel darah, jadi disimpan bersamaan. */
export function FormUreumKreatinin({ tanggalHariIni }: { tanggalHariIni: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(
    aksiSimpanUreumKreatinin,
    STATUS_AWAL,
  )
  const formulir = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (status.sukses) formulir.current?.reset()
  }, [status.sukses, status])

  return (
    <form ref={formulir} action={aksi} className="space-y-4" noValidate>
      <div>
        <h3 className="font-bold">Ureum dan kreatinin</h3>
        <p className="text-xs text-muted">Diperiksa setahun sekali. Satuan mg/dL.</p>
      </div>

      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <Kolom label="Tanggal periksa" htmlFor="tanggal_uk" galat={status.galat?.tanggal}>
        <Input
          id="tanggal_uk"
          name="tanggal"
          type="date"
          max={tanggalHariIni}
          defaultValue={tanggalHariIni}
          required
        />
      </Kolom>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Ureum" htmlFor="ureum" petunjuk="mg/dL" galat={status.galat?.ureum}>
          <Input
            id="ureum"
            name="ureum"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            max="9999"
            placeholder="120"
            required
          />
        </Kolom>

        <Kolom
          label="Kreatinin"
          htmlFor="kreatinin"
          petunjuk="mg/dL"
          galat={status.galat?.kreatinin}
        >
          <Input
            id="kreatinin"
            name="kreatinin"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max="9999"
            placeholder="9.8"
            required
          />
        </Kolom>
      </div>

      <Kolom label="Catatan" htmlFor="catatan_uk" galat={status.galat?.catatan}>
        <Input id="catatan_uk" name="catatan" placeholder="Opsional" />
      </Kolom>

      <Tombol type="submit" disabled={sedang} className="w-full">
        {sedang ? 'Menyimpan…' : 'Simpan hasil'}
      </Tombol>
    </form>
  )
}
