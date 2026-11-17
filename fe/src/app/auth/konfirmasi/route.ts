import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { buatKlienServer } from '@catatanhd/be/supabase/server'

/**
 * Menerima tautan verifikasi email dari Supabase.
 * Dua bentuk didukung: `code` (alur PKCE) dan `token_hash` (template email
 * yang disesuaikan). Setelah berhasil, pengguna diarahkan ke halaman masuk.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const kode = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const tipe = searchParams.get('type') as EmailOtpType | null

  const supabase = await buatKlienServer()
  let berhasil = false

  if (kode) {
    const { error } = await supabase.auth.exchangeCodeForSession(kode)
    berhasil = !error
  } else if (tokenHash && tipe) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipe })
    berhasil = !error
  }

  const tujuan = berhasil ? '/masuk?verifikasi=1' : '/masuk?galat=verifikasi'
  return NextResponse.redirect(new URL(tujuan, origin))
}
