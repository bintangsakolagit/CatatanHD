import type { Metadata } from 'next'
import Link from 'next/link'
import { nomorAdmin } from '@catatanhd/be/services/email'
import { Kartu } from '@/components/ui/kartu'

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

export default function HalamanLupaPassword() {
  let nomor = ''
  try {
    nomor = nomorAdmin()
  } catch {
    // Bila admin belum mengisi nomor, halaman tetap tampil tanpa tautan.
    nomor = ''
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Bantuan akun
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Lupa password</h1>
        <p className="text-sm text-muted">
          Reset password dilakukan oleh admin. Siapkan email akun Anda sebelum menghubungi.
        </p>
      </div>

      <Kartu className="space-y-4 p-5">
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="angka font-bold text-muted">1</span>
            <span>Hubungi admin melalui WhatsApp dan sebutkan email akun Anda.</span>
          </li>
          <li className="flex gap-3">
            <span className="angka font-bold text-muted">2</span>
            <span>Admin mengirim tautan pengaturan ulang password ke email tersebut.</span>
          </li>
          <li className="flex gap-3">
            <span className="angka font-bold text-muted">3</span>
            <span>Buka tautan, buat password baru, lalu masuk kembali.</span>
          </li>
        </ol>

        {nomor ? (
          <a
            href={tautanWhatsApp(nomor)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center rounded-kontrol border border-primary bg-primary px-4 text-sm font-semibold text-on-primary"
          >
            Hubungi admin di WhatsApp
          </a>
        ) : (
          <p className="rounded-kontrol border border-border px-4 py-3 text-sm text-muted">
            Nomor admin belum diatur. Hubungi petugas unit hemodialisa tempat Anda biasa cuci darah.
          </p>
        )}
      </Kartu>

      <Link
        href="/masuk"
        className="inline-block text-sm font-semibold underline underline-offset-4"
      >
        Kembali ke halaman masuk
      </Link>
    </div>
  )
}
