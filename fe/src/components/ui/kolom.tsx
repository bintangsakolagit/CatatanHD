import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { lk } from '@/lib/kelas'

const gayaDasar =
  'w-full rounded-kontrol border border-border bg-surface px-4 text-base text-text shadow-[inset_0_1px_2px_rgb(16_34_28/0.04)] transition placeholder:text-muted/55 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-60'

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
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-text">
        {label}
      </label>
      {children}
      {galat ? (
        <p className="text-xs font-semibold text-danger" role="alert">
          {galat}
        </p>
      ) : petunjuk ? (
        <p className="text-xs leading-relaxed text-muted">{petunjuk}</p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...sisa }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={lk(gayaDasar, 'h-12', className)} {...sisa} />
}

export function Pilihan({ className, children, ...sisa }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={lk(gayaDasar, 'h-12', className)} {...sisa}>
      {children}
    </select>
  )
}

export function AreaTeks({
  className,
  rows = 3,
  ...sisa
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={lk(gayaDasar, 'py-3', className)} {...sisa} />
}
