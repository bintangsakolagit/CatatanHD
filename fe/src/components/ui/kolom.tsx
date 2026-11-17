import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { lk } from '@/lib/kelas'

const gayaDasar =
  'w-full rounded-kontrol border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 transition disabled:opacity-60'

/** Label, petunjuk, dan pesan galat dibungkus agar formulir konsisten. */
export function Kolom({
  label,
  htmlFor,
  petunjuk,
  galat,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  petunjuk?: string
  galat?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={lk('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {galat ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {galat}
        </p>
      ) : petunjuk ? (
        <p className="text-xs text-muted">{petunjuk}</p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...sisa }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={lk(gayaDasar, 'h-11', className)} {...sisa} />
}

export function Pilihan({ className, children, ...sisa }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={lk(gayaDasar, 'h-11', className)} {...sisa}>
      {children}
    </select>
  )
}

export function AreaTeks({
  className,
  rows = 3,
  ...sisa
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={lk(gayaDasar, 'py-2.5', className)} {...sisa} />
}
