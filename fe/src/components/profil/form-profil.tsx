'use client'

import { useActionState } from 'react'
import { aksiUbahProfil } from '@/actions/profil'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom, AreaTeks } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'

export interface DataProfilForm {
  nama: string
  username: string
  tanggal_lahir: string
  alamat: string
  bb_kering_kg: number
}

/** Menyunting data dasar pasien. Email dan role tidak dapat diubah dari sini. */
export function FormProfil({ profil }: { profil: DataProfilForm }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiUbahProfil, STATUS_AWAL)

  return (
    <form action={aksi} className="space-y-4" noValidate>
      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <Kolom label="Nama lengkap" htmlFor="nama" galat={status.galat?.nama}>
        <Input id="nama" name="nama" defaultValue={profil.nama} required />
      </Kolom>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Username" htmlFor="username" galat={status.galat?.username}>
          <Input id="username" name="username" defaultValue={profil.username} required />
        </Kolom>

        <Kolom label="Tanggal lahir" htmlFor="tanggal_lahir" galat={status.galat?.tanggal_lahir}>
          <Input
            id="tanggal_lahir"
            name="tanggal_lahir"
            type="date"
            defaultValue={profil.tanggal_lahir}
            required
          />
        </Kolom>
      </div>

      <Kolom label="Alamat" htmlFor="alamat" galat={status.galat?.alamat}>
        <AreaTeks id="alamat" name="alamat" rows={2} defaultValue={profil.alamat} required />
      </Kolom>

      <Kolom
        label="Berat badan kering"
        htmlFor="bb_kering_kg"
        petunjuk="Dalam kilogram. Menjadi acuan target penurunan cairan."
        galat={status.galat?.bb_kering_kg}
      >
        <Input
          id="bb_kering_kg"
          name="bb_kering_kg"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="20"
          max="250"
          defaultValue={profil.bb_kering_kg}
          required
        />
      </Kolom>

      <div className="flex justify-end">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? 'Menyimpan…' : 'Simpan profil'}
        </Tombol>
      </div>
    </form>
  )
}
