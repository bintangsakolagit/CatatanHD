import 'server-only'
import { opsionalEnv, wajibEnv } from '../util/env'

/**
 * Pengiriman email lewat API Resend.
 * Sengaja memakai fetch langsung tanpa SDK agar dependensi tetap kecil.
 * Bila kunci belum diisi, fungsi mengembalikan status gagal tanpa melempar
 * error supaya alur utama (pendaftaran, retensi) tidak ikut runtuh.
 */

export interface Email {
  ke: string
  subjek: string
  html: string
}

export interface HasilEmail {
  ok: boolean
  alasan?: string
}

export async function kirimEmail({ ke, subjek, html }: Email): Promise<HasilEmail> {
  const kunci = opsionalEnv('RESEND_API_KEY')
  const pengirim = opsionalEnv('EMAIL_PENGIRIM') ?? 'CatatanHD <no-reply@localhost>'

  if (!kunci) {
    console.warn(`[email] RESEND_API_KEY belum diisi. Email "${subjek}" ke ${ke} dilewati.`)
    return { ok: false, alasan: 'EMAIL_BELUM_DIKONFIGURASI' }
  }

  try {
    const respons = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kunci}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: pengirim, to: [ke], subject: subjek, html }),
      signal: AbortSignal.timeout(8000),
    })

    if (!respons.ok) {
      const isi = await respons.text()
      console.error('[email] Resend menolak permintaan:', respons.status, isi)
      return { ok: false, alasan: 'PENYEDIA_MENOLAK' }
    }

    return { ok: true }
  } catch (kesalahan) {
    console.error('[email] Gagal menghubungi Resend:', kesalahan)
    return { ok: false, alasan: 'JARINGAN' }
  }
}

/** Tautan aplikasi untuk isi email, diambil dari env agar tidak salah domain. */
export function alamatAplikasi(): string {
  return opsionalEnv('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000'
}

/** Nomor admin yang ditampilkan di halaman lupa password. */
export function nomorAdmin(): string {
  return wajibEnv('ADMIN_WHATSAPP')
}
