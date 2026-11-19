import Link from 'next/link'
import type { ReactNode } from 'react'
import { Ikon, LogoCatatan } from '@/components/ui/ikon'
import { TombolTema } from '@/components/ui/tombol-tema'

/** Layout halaman masuk, daftar, dan lupa password. Fokus pada satu tugas. */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoCatatan />
          <span className="text-[17px] font-extrabold tracking-tight">CatatanHD</span>
        </Link>
        <TombolTema ringkas />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:pb-16">
        <div className="w-full max-w-lg">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary-kuat">
            <Ikon nama="perisai" className="h-4 w-4" />
            Catatan pribadi, hanya untuk Anda dan admin unit
          </div>
          <div className="gradien-utama h-1.5 w-full rounded-t-card" aria-hidden="true" />
          <div className="rounded-b-card rounded-t-none border border-t-0 border-border/80 bg-surface p-6 shadow-lembut sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="px-5 pb-8 text-center text-xs leading-relaxed text-muted">
        Buku catatan pribadi pasien hemodialisa.
        <br />
        Bukan rekam medis resmi.
      </footer>
    </div>
  )
}
