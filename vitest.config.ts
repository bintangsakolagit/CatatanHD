import { defineConfig } from 'vitest/config'

/**
 * Uji unit berjalan tanpa database sehingga bisa dieksekusi di mesin mana pun.
 * Uji RLS punya konfigurasi terpisah karena butuh Supabase lokal yang menyala.
 */
export default defineConfig({
  test: {
    include: ['be/tests/unit/**/*.test.ts', 'fe/tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
