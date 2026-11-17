import { defineConfig } from 'vitest/config'

/**
 * Uji RLS memakai Supabase lokal (butuh Docker).
 * Jalankan `supabase start` lalu `npm run test:rls`.
 */
export default defineConfig({
  test: {
    include: ['be/tests/rls/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
