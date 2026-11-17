'use client'

import { useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { aksiSimpanHb } from '@/actions/lab'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'

/** Formulir HB, dicatat satu nilai per tanggal pemeriksaan. */
export function FormHb({ tanggalHariIni }: { tanggalHariIni: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiSimpanHb, STATUS_AWAL)
  const formulir = useRef<HTMLFormElement>(null)

  // Setelah tersimpan, kolom dikosongkan agar siap untuk pemeriksaan berikutnya.
  useEffect(() => {
    if (status.sukses) formulir.current?.reset()
  }, [status.sukses, status])

  return (
    <form ref={formulir} action={aksi} className="space-y-4" noValidate>
      <div>
        <h3 className="font-bold">Hemoglobin (HB)</h3>
        <p className="text-xs text-muted">Diperiksa sebulan sekali. Satuan g/dL.</p>
      </div>

      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Tanggal periksa" htmlFor="tanggal_hb" galat={status.galat?.tanggal}>
          <Input
            id="tanggal_hb"
            name="tanggal"
            type="date"
            max={tanggalHariIni}
            defaultValue={tanggalHariIni}
            required
          />
        </Kolom>

        <Kolom label="Nilai HB" htmlFor="nilai_hb" petunjuk="g/dL" galat={status.galat?.nilai}>
          <Input
            id="nilai_hb"
            name="nilai"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            max="30"
            placeholder="10.5"
            required
          />
        </Kolom>
      </div>

      <Kolom label="Catatan" htmlFor="catatan_hb" galat={status.galat?.catatan}>
        <Input id="catatan_hb" name="catatan" placeholder="Opsional" />
      </Kolom>

      <Tombol type="submit" disabled={sedang} className="w-full">
        {sedang ? 'Menyimpan…' : 'Simpan HB'}
      </Tombol>
    </form>
  )
}
