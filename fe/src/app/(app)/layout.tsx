import Link from 'next/link'
import type { ReactNode } from 'react'
import { aksiKeluar } from '@/actions/autentikasi'
import { Navigasi, NavigasiBawah } from '@/components/navigasi'
import { Ikon, LogoCatatan } from '@/components/ui/ikon'
import { TombolTema } from '@/components/ui/tombol-tema'
import { wajibLogin } from '@catatanhd/be/auth/sesi'

/** Kerangka halaman untuk pengguna yang sudah masuk. */
export default async function LayoutAplikasi({ children }: { children: ReactNode }) {
  const sesi = await wajibLogin()
  const admin = sesi.profil.role === 'super_admin'
  const namaDepan = sesi.profil.nama.split(' ')[0] ?? sesi.profil.nama

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="tanpa-cetak sticky top-0 z-20 border-b border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/beranda" className="flex shrink-0 items-center gap-2.5">
            <LogoCatatan />
            <span className="leading-tight">
              <span className="block text-[17px] font-extrabold tracking-tight">CatatanHD</span>
              <span className="hidden text-[11px] font-medium text-muted sm:block">
                Halo, {namaDepan}
              </span>
            </span>
          </Link>

          <Navigasi admin={admin} />

          <div className="flex items-center gap-1">
            <TombolTema ringkas />
            <form action={aksiKeluar}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <Ikon nama="keluar" className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
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
