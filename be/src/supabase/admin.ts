import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { wajibEnv } from '../util/env'

/**
 * Klien service role hanya untuk operasi yang memang tidak mungkin dilakukan
 * pengguna: membuat profil saat pendaftaran, mengelola akun dari panel admin,
 * dan menjalankan retensi.
 *
 * Modul ini sengaja dipisah dan diberi penanda server-only supaya kuncinya
 * tidak pernah ikut ke bundel browser.
 */
export function buatKlienAdmin() {
  return createClient<Database>(
    wajibEnv('NEXT_PUBLIC_SUPABASE_URL'),
    wajibEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  )
}
