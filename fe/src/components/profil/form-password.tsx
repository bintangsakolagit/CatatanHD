'use client'

import { useActionState } from 'react'
import { aksiUbahPassword } from '@/actions/profil'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'

/** Mengganti password akun yang sedang aktif. */
export function FormPassword() {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiUbahPassword, STATUS_AWAL)

  return (
    <form action={aksi} className="space-y-4" noValidate>
      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <Kolom
        label="Password baru"
        htmlFor="password_baru"
        petunjuk="Minimal 8 karakter, memuat huruf dan angka."
        galat={status.galat?.password_baru}
      >
        <Input
          id="password_baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          required
        />
      </Kolom>

      <Kolom
        label="Ulangi password baru"
        htmlFor="konfirmasi_password"
        galat={status.galat?.konfirmasi_password}
      >
        <Input
          id="konfirmasi_password"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Kolom>

      <div className="flex justify-end">
        <Tombol type="submit" varian="sekunder" disabled={sedang}>
          {sedang ? 'Menyimpan…' : 'Ganti password'}
        </Tombol>
      </div>
    </form>
  )
}
