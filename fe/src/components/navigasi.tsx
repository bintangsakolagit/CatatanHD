'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { lk } from '@/lib/kelas'

/**
 * Navigasi utama.
 * `mode="bawah"` dipakai sebagai bilah bawah pada layar kecil; mode atas
 * dipakai di header untuk tablet dan desktop.
 */

type Item = { href: string; label: string; cocok: string }

const ITEM_DASAR: Item[] = [
  { href: '/beranda', label: 'Beranda', cocok: '/beranda' },
  { href: '/histori', label: 'Histori', cocok: '/histori' },
  { href: '/lab', label: 'Lab', cocok: '/lab' },
  { href: '/profil', label: 'Profil', cocok: '/profil' },
]

const ITEM_BAWAH: Item[] = [
  { href: '/beranda', label: 'Beranda', cocok: '/beranda' },
  { href: '/histori', label: 'Histori', cocok: '/histori' },
  { href: '/catatan/baru', label: 'Catat', cocok: '/catatan' },
  { href: '/lab', label: 'Lab', cocok: '/lab' },
  { href: '/profil', label: 'Profil', cocok: '/profil' },
]

function aktif(pathname: string, cocok: string): boolean {
  return pathname === cocok || pathname.startsWith(`${cocok}/`)
}

export function Navigasi({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname()
  const item = admin
    ? [...ITEM_DASAR, { href: '/pengguna', label: 'Pengguna', cocok: '/pengguna' }]
    : ITEM_DASAR

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
      {item.map((tautan) => (
        <Link
          key={tautan.href}
          href={tautan.href}
          aria-current={aktif(pathname, tautan.cocok) ? 'page' : undefined}
          className={lk(
            'rounded-kontrol px-3 py-2 text-sm font-semibold transition',
            aktif(pathname, tautan.cocok)
              ? 'bg-primary text-on-primary'
              : 'text-muted hover:bg-black/[0.04] hover:text-text dark:hover:bg-white/[0.08]',
          )}
        >
          {tautan.label}
        </Link>
      ))}
    </nav>
  )
}

export function NavigasiBawah() {
  const pathname = usePathname()

  return (
    <nav
      className="tanpa-cetak fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigasi bawah"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEM_BAWAH.map((tautan) => {
          const menyala = aktif(pathname, tautan.cocok)
          const utama = tautan.href === '/catatan/baru'
          return (
            <li key={tautan.href} className="flex-1">
              <Link
                href={tautan.href}
                aria-current={menyala ? 'page' : undefined}
                className={lk(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition',
                  menyala ? 'text-text' : 'text-muted',
                )}
              >
                <span
                  className={lk(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-sm leading-none',
                    utama
                      ? 'border-primary bg-primary text-on-primary'
                      : menyala
                        ? 'border-text'
                        : 'border-transparent',
                  )}
                  aria-hidden="true"
                >
                  {utama ? '+' : <Titik aktif={menyala} />}
                </span>
                {tautan.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Penanda sederhana agar bilah bawah tidak bergantung pada pustaka ikon. */
function Titik({ aktif: menyala }: { aktif: boolean }) {
  return (
    <span
      className={lk('h-2 w-2 rounded-full', menyala ? 'bg-text' : 'bg-muted')}
      aria-hidden="true"
    />
  )
}
