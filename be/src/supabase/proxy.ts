import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '../types/database'
import { wajibEnv } from '../util/env'

/**
 * Menyegarkan cookie sesi pada setiap permintaan.
 * Dipanggil dari proxy.ts Next.js. Tanpa langkah ini, token yang hampir
 * kedaluwarsa bisa membuat pengguna terlempar ke halaman masuk secara acak.
 */
export async function perbaruiSesi(
  request: NextRequest,
): Promise<{ respons: NextResponse; pengguna: User | null }> {
  let respons = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    wajibEnv('NEXT_PUBLIC_SUPABASE_URL'),
    wajibEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(daftarCookie) {
          // Cookie harus ditulis ke request agar Server Component membaca sesi baru,
          // lalu ke response agar browser menyimpannya.
          daftarCookie.forEach(({ name, value }) => request.cookies.set(name, value))
          respons = NextResponse.next({ request })
          daftarCookie.forEach(({ name, value, options }) =>
            respons.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  return { respons, pengguna: data.user }
}
