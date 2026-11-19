'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { aksiDaftar } from '@/actions/autentikasi'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol, gayaTombol } from '@/components/ui/tombol'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'

export function FormDaftar() {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiDaftar, STATUS_AWAL)
  const hariIni = tanggalJakarta()

  if (status.sukses) {
    return (
      <div className="space-y-4">
        <Peringatan jenis="sukses" judul="Periksa email Anda">
          {status.pesan}
        </Peringatan>
        <p className="text-sm text-muted">
          Email verifikasi dikirim oleh layanan CatatanHD. Bila tidak terlihat dalam beberapa menit,
          periksa folder spam atau hubungi admin.
        </p>
        <Link href="/masuk" className={gayaTombol('utama', 'md', 'w-full')}>
          Ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <form key={status.kunci ?? 0} action={aksi} className="space-y-4" noValidate>
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <Kolom label="Nama lengkap" htmlFor="nama" galat={status.galat?.nama}>
        <Input
          id="nama"
          name="nama"
          autoComplete="name"
          placeholder="Nama sesuai identitas"
          defaultValue={status.nilai?.nama ?? ''}
          required
        />
      </Kolom>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Email aktif" htmlFor="email" galat={status.galat?.email}>
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

        <Kolom
          label="Username"
          htmlFor="username"
          petunjuk="Huruf kecil, angka, titik, garis bawah."
          galat={status.galat?.username}
        >
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="nama.pasien"
            defaultValue={status.nilai?.username ?? ''}
            required
          />
        </Kolom>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Password" htmlFor="password" galat={status.galat?.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            required
          />
        </Kolom>

        <Kolom
          label="Ulangi password"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kolom label="Tanggal lahir" htmlFor="tanggal_lahir" galat={status.galat?.tanggal_lahir}>
          <Input
            id="tanggal_lahir"
            name="tanggal_lahir"
            type="date"
            max={hariIni}
            defaultValue={status.nilai?.tanggal_lahir ?? ''}
            required
          />
        </Kolom>

        <Kolom
          label="Berat badan kering"
          htmlFor="bb_kering_kg"
          petunjuk="Dalam kilogram, satu angka desimal."
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
            placeholder="60.5"
            defaultValue={status.nilai?.bb_kering_kg ?? ''}
            required
          />
        </Kolom>
      </div>

      <Kolom label="Alamat" htmlFor="alamat" galat={status.galat?.alamat}>
        <Input
          id="alamat"
          name="alamat"
          autoComplete="street-address"
          placeholder="Alamat tinggal"
          defaultValue={status.nilai?.alamat ?? ''}
          required
        />
      </Kolom>

      <Tombol type="submit" className="w-full" disabled={sedang}>
        {sedang ? 'Mendaftarkan…' : 'Daftar'}
      </Tombol>

      <p className="text-sm text-muted">
        Sudah punya akun?{' '}
        <Link
          href="/masuk"
          className="font-semibold text-primary-kuat underline underline-offset-4"
        >
          Masuk
        </Link>
      </p>
    </form>
  )
}
