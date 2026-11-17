'use client'

import { Tombol } from '@/components/ui/tombol'

/** Mencetak halaman histori. CSS @media print menyembunyikan navigasi dan filter. */
export function TombolCetak() {
  return (
    <Tombol
      type="button"
      varian="sekunder"
      ukuran="sm"
      onClick={() => window.print()}
      className="tanpa-cetak"
    >
      Cetak
    </Tombol>
  )
}
