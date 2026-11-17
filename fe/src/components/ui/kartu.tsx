import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'

/** Kartu putih berborder hitam, sesuai aturan desain. */
export function Kartu({
  children,
  className,
  cetak = false,
}: {
  children: ReactNode
  className?: string
  cetak?: boolean
}) {
  return (
    <section
      className={lk(
        'rounded-card border border-border bg-surface',
        cetak && 'kartu-cetak',
        className,
      )}
    >
      {children}
    </section>
  )
}

/** Judul bagian dengan label kecil di atas, dipakai konsisten di semua halaman. */
export function JudulBagian({
  label,
  judul,
  keterangan,
  aksi,
}: {
  label?: string
  judul: string
  keterangan?: string
  aksi?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        {label ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {label}
          </p>
        ) : null}
        <h2 className="text-lg font-bold tracking-tight">{judul}</h2>
        {keterangan ? <p className="text-sm text-muted">{keterangan}</p> : null}
      </div>
      {aksi}
    </div>
  )
}

/** Satu angka besar dengan keterangan, dipakai di beranda dan ringkasan histori. */
export function Statistik({
  label,
  nilai,
  satuan,
  keterangan,
}: {
  label: string
  nilai: ReactNode
  satuan?: string
  keterangan?: string
}) {
  return (
    <div className="rounded-kontrol border border-border bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="angka text-2xl font-bold">{nilai}</span>
        {satuan ? <span className="text-sm text-muted">{satuan}</span> : null}
      </p>
      {keterangan ? <p className="mt-1 text-xs text-muted">{keterangan}</p> : null}
    </div>
  )
}
