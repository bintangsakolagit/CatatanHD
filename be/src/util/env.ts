/**
 * Pembacaan variabel lingkungan dengan pesan galat yang jelas.
 * Sengaja tidak di-cache supaya perubahan saat pengembangan langsung terbaca.
 */

export function wajibEnv(nama: string): string {
  const nilai = process.env[nama]
  if (!nilai || nilai.trim() === '') {
    throw new Error(
      `Variabel lingkungan ${nama} belum diisi. Salin .env.example ke fe/.env.local lalu lengkapi nilainya.`,
    )
  }
  return nilai
}

export function opsionalEnv(nama: string): string | undefined {
  const nilai = process.env[nama]
  return nilai && nilai.trim() !== '' ? nilai : undefined
}
