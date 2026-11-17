import { NextResponse, type NextRequest } from 'next/server'
import { perbaruiSesi } from '@catatanhd/be/supabase/proxy'

/** Rute yang hanya boleh dibuka setelah masuk. */
const RUTE_PRIVAT = ['/beranda', '/catatan', '/histori', '/lab', '/profil', '/pengguna']

/** Rute untuk pengguna yang belum masuk. */
const RUTE_TAMU = ['/masuk', '/daftar']

function cocok(pathname: string, daftar: string[]): boolean {
  return daftar.some((awal) => pathname === awal || pathname.startsWith(`${awal}/`))
}

/**
 * Next.js 16 memakai nama `proxy` untuk lapisan yang berjalan sebelum render.
 * Tugasnya hanya dua: menyegarkan cookie sesi dan mengarahkan pengguna yang
 * belum masuk. Pemeriksaan role dilakukan di layout admin karena butuh query.
 */
export async function proxy(request: NextRequest) {
  const { respons, pengguna } = await perbaruiSesi(request)
  const { pathname, search } = request.nextUrl

  // Saat mengalihkan, cookie sesi yang baru disegarkan harus tetap dibawa.
  function alihkan(tujuan: string) {
    const pengalihan = NextResponse.redirect(new URL(tujuan, request.url))
    respons.cookies.getAll().forEach((cookie) => pengalihan.cookies.set(cookie))
    return pengalihan
  }

  if (!pengguna && cocok(pathname, RUTE_PRIVAT)) {
    return alihkan(`/masuk?lanjut=${encodeURIComponent(pathname + search)}`)
  }

  if (pengguna && RUTE_TAMU.includes(pathname)) {
    return alihkan('/beranda')
  }

  return respons
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
