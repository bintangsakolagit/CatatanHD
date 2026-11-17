/**
 * Pemformatan angka dan tanggal untuk seluruh antarmuka.
 * Semua nilai tampil memakai konvensi Indonesia: koma desimal, nama bulan
 * disingkat, dan satuan yang selalu ikut agar tidak menimbulkan tebakan.
 */

const ZONA = 'Asia/Jakarta'

const pemformatTanggal = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const pemformatTanggalPanjang = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Tanggal ISO YYYY-MM-DD diubah menjadi Date UTC agar tidak bergeser hari. */
function keTanggal(iso: string): Date | null {
  const bagian = iso.split('-').map(Number)
  const [tahun, bulan, hari] = bagian
  if (tahun === undefined || bulan === undefined || hari === undefined) return null
  return new Date(Date.UTC(tahun, bulan - 1, hari))
}

export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return '—'
  const tanggal = keTanggal(iso)
  return tanggal ? pemformatTanggal.format(tanggal) : '—'
}

export function formatTanggalPanjang(iso: string | null | undefined): string {
  if (!iso) return '—'
  const tanggal = keTanggal(iso)
  return tanggal ? pemformatTanggalPanjang.format(tanggal) : '—'
}

/** Waktu kejadian (timestamp) ditampilkan dalam zona Jakarta. */
export function formatWaktu(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  }).format(new Date(iso))
}

/** Angka desimal memakai koma; nilai kosong ditampilkan sebagai tanda hubung. */
export function formatAngka(nilai: number | null | undefined, desimal = 1): string {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return '—'
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: desimal,
  }).format(nilai)
}

export function formatBerat(kg: number | null | undefined): string {
  if (kg === null || kg === undefined) return '—'
  return `${formatAngka(kg, 1)} kg`
}

export function formatTensi(sistolik: number | null, diastolik: number | null): string {
  if (sistolik === null || diastolik === null) return '—'
  return `${sistolik}/${diastolik}`
}

/** Selisih berat sebelum dan sesudah cuci darah, hanya bila keduanya terisi. */
export function selisihBerat(
  pra: number | null | undefined,
  pasca: number | null | undefined,
): number | null {
  if (pra === null || pra === undefined || pasca === null || pasca === undefined) return null
  return Math.round((pra - pasca) * 10) / 10
}

/** Jam dari kolom time Postgres (09:30:00) dipotong menjadi 09:30. */
export function formatJam(jam: string): string {
  return jam.slice(0, 5)
}

export function formatNilaiLab(nilai: number): string {
  return formatAngka(nilai, 2)
}
