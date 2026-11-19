import type { Metadata } from 'next'
import Link from 'next/link'
import { nomorAdmin } from '@catatanhd/be/services/email'
import { Ikon } from '@/components/ui/ikon'
import { gayaTombol } from '@/components/ui/tombol'

export const metadata: Metadata = { title: 'Lupa password' }

/** Nomor WhatsApp dinormalkan ke format internasional agar tautan wa.me valid. */
function tautanWhatsApp(nomor: string): string {
  const angka = nomor.replace(/\D/g, '')
  const internasional = angka.startsWith('0') ? `62${angka.slice(1)}` : angka
  const teks = encodeURIComponent(
    'Halo admin CatatanHD, saya lupa password akun saya. Mohon bantu reset.',
  )
  return `https://wa.me/${internasional}?text=${teks}`
}

const LANGKAH = [
  'Hubungi admin melalui WhatsApp dan sebutkan email akun Anda.',
  'Admin mengirim tautan pengaturan ulang password ke email tersebut.',
  'Buka tautan, buat password baru, lalu masuk kembali.',
]

export default function HalamanLupaPassword() {
  let nomor = ''
  try {
    nomor = nomorAdmin()
  } catch {
    // Bila admin belum mengisi nomor, halaman tetap tampil tanpa tautan.
    nomor = ''
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <Ikon nama="kunci" className="h-3.5 w-3.5" tebal={2.2} />
          Bantuan akun
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Lupa password</h1>
        <p className="text-sm text-muted">
          Reset password dilakukan oleh admin. Siapkan email akun Anda sebelum menghubungi.
        </p>
      </div>

      <ol className="space-y-3">
        {LANGKAH.map((teks, indeks) => (
          <li
            key={teks}
            className="flex items-start gap-3 rounded-kontrol border border-border/70 bg-bg/60 p-3.5 text-sm"
          >
            <span className="gradien-utama flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-on-primary">
              {indeks + 1}
            </span>
            <span className="leading-relaxed">{teks}</span>
          </li>
        ))}
      </ol>

      {nomor ? (
        <a
          href={tautanWhatsApp(nomor)}
          target="_blank"
          rel="noopener noreferrer"
          className={gayaTombol('utama', 'md', 'w-full')}
        >
          <Ikon nama="catatan" className="h-4 w-4" />
          Hubungi admin di WhatsApp
        </a>
      ) : (
        <p className="rounded-kontrol border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
          Nomor admin belum diatur. Hubungi petugas unit hemodialisa tempat Anda biasa cuci darah.
        </p>
      )}

      <Link
        href="/masuk"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary-kuat"
      >
        <Ikon nama="kembali" className="h-4 w-4" />
        Kembali ke halaman masuk
      </Link>
    </div>
  )
}
