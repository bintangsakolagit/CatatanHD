'use client'

import { useActionState } from 'react'
import { aksiHapusLab } from '@/actions/lab'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Tombol } from '@/components/ui/tombol'

/** Menghapus satu catatan laboratorium dengan konfirmasi singkat. */
export function TombolHapusLab({ id }: { id: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiHapusLab, STATUS_AWAL)

  return (
    <form
      action={aksi}
      onSubmit={(event) => {
        if (!window.confirm('Hapus catatan pemeriksaan ini?')) event.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya" ukuran="sm" disabled={sedang}>
        {sedang ? 'Menghapus…' : 'Hapus'}
      </Tombol>
      {status.galat?.umum ? (
        <p className="mt-1 text-xs font-medium text-danger">{status.galat.umum}</p>
      ) : null}
    </form>
  )
}
