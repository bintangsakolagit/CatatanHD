import type { ReactNode } from 'react'
import { lk } from '@/lib/kelas'
import { Ikon, type NamaIkon } from './ikon'

/** Kartu permukaan dengan sudut besar dan bayangan tipis agar terasa lembut. */
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
        'rounded-card border border-border/80 bg-surface shadow-lembut',
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
  ikon,
}: {
  label?: string
  judul: string
  keterangan?: string
  aksi?: ReactNode
  ikon?: NamaIkon
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 space-y-1">
        {label ? (
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {ikon ? <Ikon nama={ikon} className="h-3.5 w-3.5" tebal={2.2} /> : null}
            {label}
          </p>
        ) : null}
        <h2 className="text-lg font-bold tracking-tight text-text">{judul}</h2>
        {keterangan ? <p className="text-sm text-muted">{keterangan}</p> : null}
      </div>
      {aksi}
    </div>
  )
}

/**
 * Satu angka besar dengan keterangan.
 * `nada` memberi latar lembut berwarna supaya ringkasan tidak terlihat abu-abu,
 * sedangkan `ikon` membantu pasien mengenali jenis data tanpa membaca label.
 */
export function Statistik({
  label,
  nilai,
  satuan,
  keterangan,
  nada = 'netral',
  ikon,
}: {
  label: string
  nilai: ReactNode
  satuan?: string
  keterangan?: string
  nada?: 'netral' | 'utama' | 'amber' | 'info' | 'lila'
  ikon?: NamaIkon
}) {
  const gayaKartu: Record<string, string> = {
    netral: 'border-border/80 bg-surface',
    utama: 'border-primary/20 bg-primary-soft',
    amber: 'border-accent/25 bg-accent-soft',
    info: 'border-info/20 bg-info-soft',
    lila: 'border-lila/20 bg-lila-soft',
  }
  const gayaAngka: Record<string, string> = {
    netral: 'text-text',
    utama: 'text-primary-kuat',
    amber: 'text-accent',
    info: 'text-info',
    lila: 'text-lila',
  }
  const gayaLabel: Record<string, string> = {
    netral: 'text-muted',
    utama: 'text-primary-kuat/75',
    amber: 'text-accent/80',
    info: 'text-info/80',
    lila: 'text-lila/80',
  }

  return (
    <div className={lk('rounded-kontrol border p-4', gayaKartu[nada])}>
      <div className="flex items-start justify-between gap-2">
        <p className={lk('text-[11px] font-bold uppercase tracking-[0.12em]', gayaLabel[nada])}>
          {label}
        </p>
        {ikon ? (
          <span className={lk('opacity-80', gayaAngka[nada])} aria-hidden="true">
            <Ikon nama={ikon} className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className={lk('angka text-2xl font-bold sm:text-[26px]', gayaAngka[nada])}>
          {nilai}
        </span>
        {satuan ? <span className="text-sm text-muted">{satuan}</span> : null}
      </p>
      {keterangan ? <p className="mt-1 text-xs text-muted">{keterangan}</p> : null}
    </div>
  )
}
