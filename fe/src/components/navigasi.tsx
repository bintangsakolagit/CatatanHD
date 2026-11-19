'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { lk } from '@/lib/kelas'
import { Ikon, type NamaIkon } from '@/components/ui/ikon'

/**
 * Navigasi utama.
 * `mode="bawah"` dipakai sebagai bilah bawah pada layar kecil; mode atas
 * dipakai di header untuk tablet dan desktop.
 */

type Item = { href: string; label: string; cocok: string; ikon: NamaIkon }

const ITEM_DASAR: Item[] = [
  { href: '/beranda', label: 'Beranda', cocok: '/beranda', ikon: 'beranda' },
  { href: '/histori', label: 'Histori', cocok: '/histori', ikon: 'histori' },
  { href: '/lab', label: 'Lab', cocok: '/lab', ikon: 'lab' },
  { href: '/profil', label: 'Profil', cocok: '/profil', ikon: 'profil' },
]

const ITEM_BAWAH: Item[] = [
  { href: '/beranda', label: 'Beranda', cocok: '/beranda', ikon: 'beranda' },
  { href: '/histori', label: 'Histori', cocok: '/histori', ikon: 'histori' },
  { href: '/catatan/baru', label: 'Catat', cocok: '/catatan', ikon: 'tambah' },
  { href: '/lab', label: 'Lab', cocok: '/lab', ikon: 'lab' },
  { href: '/profil', label: 'Profil', cocok: '/profil', ikon: 'profil' },
]

function aktif(pathname: string, cocok: string): boolean {
  return pathname === cocok || pathname.startsWith(`${cocok}/`)
}

export function Navigasi({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname()
  const item: Item[] = admin
    ? [
        ...ITEM_DASAR,
        { href: '/pengguna', label: 'Pengguna', cocok: '/pengguna', ikon: 'pengguna' },
      ]
    : ITEM_DASAR

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
      {item.map((tautan) => {
        const menyala = aktif(pathname, tautan.cocok)
        return (
          <Link
            key={tautan.href}
            href={tautan.href}
            aria-current={menyala ? 'page' : undefined}
            className={lk(
              'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition',
              menyala
                ? 'bg-primary-soft text-primary-kuat'
                : 'text-muted hover:bg-surface-2 hover:text-text',
            )}
          >
            <Ikon nama={tautan.ikon} className="h-4 w-4" />
            {tautan.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function NavigasiBawah() {
  const pathname = usePathname()

  return (
    <nav
      className="tanpa-cetak fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-18px_rgb(16_34_28/0.45)] backdrop-blur md:hidden"
      aria-label="Navigasi bawah"
    >
      <ul className="mx-auto flex max-w-lg items-stretch px-1">
        {ITEM_BAWAH.map((tautan) => {
          const menyala = aktif(pathname, tautan.cocok)
          const utama = tautan.href === '/catatan/baru'
          return (
            <li key={tautan.href} className="flex-1">
              <Link
                href={tautan.href}
                aria-current={menyala ? 'page' : undefined}
                className={lk(
                  'flex h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition',
                  menyala ? 'text-primary-kuat' : 'text-muted',
                )}
              >
                <span
                  className={lk(
                    'flex items-center justify-center transition',
                    utama
                      ? 'gradien-utama -mt-3 h-12 w-12 rounded-full text-on-primary shadow-lembut'
                      : lk(
                          'h-8 w-12 rounded-full',
                          menyala ? 'bg-primary-soft text-primary-kuat' : 'text-muted',
                        ),
                  )}
                  aria-hidden="true"
                >
                  <Ikon nama={tautan.ikon} className={utama ? 'h-6 w-6' : 'h-5 w-5'} />
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
