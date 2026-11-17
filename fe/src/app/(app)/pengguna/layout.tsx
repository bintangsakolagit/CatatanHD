import type { ReactNode } from 'react'
import { wajibAdmin } from '@catatanhd/be/auth/guard'

/**
 * Pembatas seluruh halaman panel admin.
 * Pemeriksaan role dilakukan di server setiap permintaan, bukan hanya di proxy,
 * sehingga tautan langsung ke /pengguna tetap ditolak untuk akun pasien.
 */
export default async function LayoutPengguna({ children }: { children: ReactNode }) {
  await wajibAdmin()
  return <>{children}</>
}
