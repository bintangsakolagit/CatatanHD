/**
 * Durasi cuci darah disimpan dalam menit agar bisa dibandingkan dan dihitung,
 * lalu ditampilkan kembali dalam bahasa sehari-hari pasien.
 */

export const DAFTAR_DURASI = [300, 270, 240, 210, 180] as const

export type DurasiMenit = (typeof DAFTAR_DURASI)[number]

/** Memvalidasi durasi terhadap pilihan yang tersedia di unit hemodialisa. */
export function durasiValid(nilai: number): nilai is DurasiMenit {
  return (DAFTAR_DURASI as readonly number[]).includes(nilai)
}

/** Contoh: 300 menjadi "5 jam", 270 menjadi "4 jam 30 menit". */
export function formatDurasi(menit: number): string {
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  if (jam === 0) return `${sisa} menit`
  if (sisa === 0) return `${jam} jam`
  return `${jam} jam ${sisa} menit`
}
