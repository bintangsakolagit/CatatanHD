import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'
import { Ikon, type NamaIkon } from './ikon'

type Jenis = 'galat' | 'sukses' | 'info' | 'peringatan'

const gaya: Record<Jenis, string> = {
  galat: 'border-danger/30 bg-danger-soft text-danger',
  sukses: 'border-ok/30 bg-ok-soft text-ok',
  info: 'border-info/25 bg-info-soft text-info',
  peringatan: 'border-accent/30 bg-accent-soft text-accent',
}

const ikon: Record<Jenis, NamaIkon> = {
  galat: 'peringatan',
  sukses: 'periksa',
  info: 'info',
  peringatan: 'peringatan',
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
      className={lk('flex gap-3 rounded-kontrol border px-4 py-3 text-sm', gaya[jenis])}
    >
      <Ikon nama={ikon[jenis]} className="mt-0.5 h-4.5 w-4.5" tebal={2} />
      <div className="min-w-0">
        {judul ? <p className="font-bold">{judul}</p> : null}
        <div className={judul ? 'mt-0.5' : undefined}>{children}</div>
      </div>
    </div>
  )
}
