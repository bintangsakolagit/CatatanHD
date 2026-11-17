'use client'

import { useActionState } from 'react'
import { aksiHapusSesi } from '@/actions/sesi'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Tombol } from '@/components/ui/tombol'

/**
 * Tombol hapus sesi dengan konfirmasi.
 * Konfirmasi memakai dialog bawaan browser agar tetap sederhana dan bisa
 * dipakai tanpa JavaScript tambahan.
 */
export function TombolHapusSesi({ id }: { id: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiHapusSesi, STATUS_AWAL)

  return (
    <form
      action={aksi}
      onSubmit={(event) => {
        const lanjut = window.confirm(
          'Hapus catatan sesi ini? Tensi berkala yang tersimpan juga ikut terhapus.',
        )
        if (!lanjut) event.preventDefault()
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya" ukuran="sm" disabled={sedang}>
        {sedang ? 'Menghapus…' : 'Hapus catatan'}
      </Tombol>
      {status.galat?.umum ? (
        <p className="text-xs font-medium text-danger">{status.galat.umum}</p>
      ) : null}
    </form>
  )
}
