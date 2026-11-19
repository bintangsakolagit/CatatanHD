import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'

type Nada = 'netral' | 'utama' | 'ok' | 'amber' | 'info' | 'lila' | 'bahaya'

const gaya: Record<Nada, string> = {
  netral: 'border-border bg-surface-2 text-muted',
  utama: 'border-primary/25 bg-primary-soft text-primary-kuat',
  ok: 'border-ok/25 bg-ok-soft text-ok',
  amber: 'border-accent/30 bg-accent-soft text-accent',
  info: 'border-info/25 bg-info-soft text-info',
  lila: 'border-lila/25 bg-lila-soft text-lila',
  bahaya: 'border-danger/25 bg-danger-soft text-danger',
}

export function Lencana({ nada = 'netral', children }: { nada?: Nada; children: ReactNode }) {
  return (
    <span
      className={lk(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        gaya[nada],
      )}
    >
      {children}
    </span>
  )
}
