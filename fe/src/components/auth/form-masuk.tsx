'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { aksiMasuk } from '@/actions/autentikasi'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Kolom, Input } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'

export function FormMasuk({ lanjut }: { lanjut?: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiMasuk, STATUS_AWAL)

  return (
    <form key={status.kunci ?? 0} action={aksi} className="space-y-4" noValidate>
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      {lanjut ? <input type="hidden" name="lanjut" value={lanjut} /> : null}

      <Kolom label="Email" htmlFor="email" galat={status.galat?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nama@email.com"
          defaultValue={status.nilai?.email ?? ''}
          required
        />
      </Kolom>

      <Kolom label="Password" htmlFor="password" galat={status.galat?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password akun"
          required
        />
      </Kolom>

      <Tombol type="submit" className="w-full" disabled={sedang}>
        {sedang ? 'Memeriksa…' : 'Masuk'}
      </Tombol>

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/lupa-password"
          className="font-semibold text-primary-kuat underline underline-offset-4"
        >
          Lupa password
        </Link>
        <Link
          href="/daftar"
          className="font-semibold text-primary-kuat underline underline-offset-4"
        >
          Buat akun
        </Link>
      </div>
    </form>
  )
}
