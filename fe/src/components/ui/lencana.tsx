import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'

type Nada = 'netral' | 'ok' | 'bahaya'

const gaya: Record<Nada, string> = {
  netral: 'border-border bg-surface text-text',
  ok: 'border-ok bg-ok-soft text-ok',
  bahaya: 'border-danger bg-danger-soft text-danger',
}

export function Lencana({ nada = 'netral', children }: { nada?: Nada; children: ReactNode }) {
  return (
    <span
      className={lk(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        gaya[nada],
      )}
    >
      {children}
    </span>
  )
}
