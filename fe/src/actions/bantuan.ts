/**
 * Pembantu kecil untuk Server Action: membaca FormData, mengambil nilai JSON
 * dari input tersembunyi, dan menyeragamkan bentuk status formulir.
 */

export function bacaForm(data: FormData): Record<string, string> {
  const hasil: Record<string, string> = {}
  data.forEach((nilai, kunci) => {
    if (typeof nilai === 'string') hasil[kunci] = nilai
  })
  return hasil
}

/** Input tersembunyi berisi JSON, misalnya daftar tensi berkala. */
export function bacaJson(data: FormData, kunci: string): unknown {
  const mentah = data.get(kunci)
  if (typeof mentah !== 'string' || mentah.trim() === '') return undefined
  try {
    return JSON.parse(mentah)
  } catch {
    return undefined
  }
}

/** Pesan umum saat service mengembalikan galat tanpa menunjuk kolom tertentu. */
export function pesanGalatUmum(galat: Record<string, string>): string | undefined {
  return galat.umum
}
