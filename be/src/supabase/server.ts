import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../types/database'
import { wajibEnv } from '../util/env'

/**
 * Klien Supabase untuk Server Component, Server Action, dan Route Handler.
 * Memakai cookie sesi pengguna, bukan service role, sehingga seluruh query
 * otomatis dibatasi oleh Row Level Security.
 */
export async function buatKlienServer() {
  const tokoCookie = await cookies()

  return createServerClient<Database>(
    wajibEnv('NEXT_PUBLIC_SUPABASE_URL'),
    wajibEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return tokoCookie.getAll()
        },
        setAll(daftarCookie) {
          try {
            daftarCookie.forEach(({ name, value, options }) => {
              tokoCookie.set(name, value, options)
            })
          } catch {
            // Server Component tidak boleh menulis cookie. Penyegaran sesi
            // sudah ditangani proxy, jadi kegagalan di sini aman diabaikan.
          }
        },
      },
    },
  )
}

export type KlienServer = Awaited<ReturnType<typeof buatKlienServer>>
