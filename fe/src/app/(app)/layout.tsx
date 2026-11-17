import Link from 'next/link'
import type { ReactNode } from 'react'
import { aksiKeluar } from '@/actions/autentikasi'
import { Navigasi, NavigasiBawah } from '@/components/navigasi'
import { TombolTema } from '@/components/ui/tombol-tema'
import { wajibLogin } from '@catatanhd/be/auth/sesi'

/** Kerangka halaman untuk pengguna yang sudah masuk. */
export default async function LayoutAplikasi({ children }: { children: ReactNode }) {
  const sesi = await wajibLogin()
  const admin = sesi.profil.role === 'super_admin'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="tanpa-cetak sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/beranda" className="shrink-0 text-lg font-extrabold tracking-tight">
            CatatanHD
          </Link>

          <Navigasi admin={admin} />

          <div className="flex items-center gap-2">
            <TombolTema ringkas />
            <form action={aksiKeluar}>
              <button
                type="submit"
                className="h-10 rounded-kontrol px-2 text-sm font-semibold text-muted transition hover:text-text"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:pb-14">{children}</main>

      <NavigasiBawah />
    </div>
  )
}
