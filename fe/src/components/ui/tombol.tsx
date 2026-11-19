import { lk } from '@/lib/kelas'

type Varian = 'utama' | 'sekunder' | 'halus' | 'bahaya'
type Ukuran = 'md' | 'sm'

const gayaVarian: Record<Varian, string> = {
  utama:
    'gradien-utama border-transparent text-on-primary shadow-lembut hover:brightness-110 active:brightness-95',
  sekunder:
    'border-border bg-surface text-text hover:border-primary/45 hover:bg-primary-soft hover:text-primary-kuat',
  halus: 'border-transparent bg-transparent text-muted hover:bg-surface-2 hover:text-text',
  bahaya: 'border-danger/30 bg-danger-soft text-danger hover:border-danger hover:bg-danger/15',
}

const gayaUkuran: Record<Ukuran, string> = {
  md: 'h-12 px-5 text-sm',
  sm: 'h-10 px-3.5 text-sm',
}

/** Kelas tombol dipakai bersama oleh <button> dan <Link> agar tampil identik. */
export function gayaTombol(varian: Varian = 'utama', ukuran: Ukuran = 'md', kelas?: string) {
  return lk(
    'inline-flex select-none items-center justify-center gap-2 rounded-kontrol border font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
    gayaVarian[varian],
    gayaUkuran[ukuran],
    kelas,
  )
}

export interface PropsTombol extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: Varian
  ukuran?: Ukuran
}

export function Tombol({
  varian = 'utama',
  ukuran = 'md',
  className,
  type = 'submit',
  ...sisa
}: PropsTombol) {
  return <button type={type} className={gayaTombol(varian, ukuran, className)} {...sisa} />
}
