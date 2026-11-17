import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'

type Jenis = 'galat' | 'sukses' | 'info' | 'peringatan'

const gaya: Record<Jenis, string> = {
  galat: 'border-danger bg-danger-soft text-danger',
  sukses: 'border-ok bg-ok-soft text-ok',
  info: 'border-border bg-surface text-text',
  peringatan: 'border-border bg-surface text-text',
}

/** Pesan status dengan peran ARIA agar pembaca layar ikut membacakannya. */
export function Peringatan({
  jenis = 'info',
  judul,
  children,
}: {
  jenis?: Jenis
  judul?: string
  children: ReactNode
}) {
  return (
    <div
      role={jenis === 'galat' ? 'alert' : 'status'}
      className={lk('rounded-kontrol border px-4 py-3 text-sm', gaya[jenis])}
    >
      {judul ? <p className="font-semibold">{judul}</p> : null}
      <div className={judul ? 'mt-1' : undefined}>{children}</div>
    </div>
  )
}
