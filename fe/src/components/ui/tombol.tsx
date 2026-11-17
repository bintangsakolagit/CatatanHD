import { lk } from '@/lib/kelas'

type Varian = 'utama' | 'sekunder' | 'halus' | 'bahaya'
type Ukuran = 'md' | 'sm'

const gayaVarian: Record<Varian, string> = {
  utama: 'border-primary bg-primary text-on-primary hover:opacity-85',
  sekunder: 'border-border bg-surface text-text hover:bg-black/[0.04] dark:hover:bg-white/[0.08]',
  halus:
    'border-transparent bg-transparent text-text hover:bg-black/[0.04] dark:hover:bg-white/[0.08]',
  bahaya: 'border-danger bg-transparent text-danger hover:bg-danger/10',
}

const gayaUkuran: Record<Ukuran, string> = {
  md: 'h-11 px-4 text-sm',
  sm: 'h-9 px-3 text-sm',
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
