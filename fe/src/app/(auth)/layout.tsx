import Link from 'next/link'
import type { ReactNode } from 'react'
import { TombolTema } from '@/components/ui/tombol-tema'

/** Layout halaman masuk, daftar, dan lupa password. Fokus pada satu tugas. */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          CatatanHD
        </Link>
        <TombolTema ringkas />
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-5 pb-8 text-center text-xs leading-relaxed text-muted">
        Buku catatan pribadi pasien hemodialisa.
        <br />
        Bukan rekam medis resmi.
      </footer>
    </div>
  )
}
