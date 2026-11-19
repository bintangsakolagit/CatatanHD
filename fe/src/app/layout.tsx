import type { Metadata, Viewport } from 'next'
import { Open_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'CatatanHD — Buku catatan pasien hemodialisa',
    template: '%s · CatatanHD',
  },
  description: 'Catat sesi cuci darah, tensi berkala, dan hasil laboratorium dalam satu tempat.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#07120f' },
  ],
}

/**
 * Skrip kecil dijalankan sebelum halaman digambar agar tema tidak berkedip.
 * Nilai pilihan pengguna disimpan di localStorage; bila belum ada, ikuti sistem.
 */
const skripTema = `(function(){try{var t=localStorage.getItem('tema');var g=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='gelap'||(!t&&g)){document.documentElement.classList.add('dark')}}catch(e){}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={openSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
