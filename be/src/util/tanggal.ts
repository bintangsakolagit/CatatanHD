/**
 * Semua perhitungan tanggal memakai satu zona waktu agar "hari ini",
 * rentang histori, dan batas retensi tidak bergeser mengikuti waktu server.
 */

export const ZONA_WAKTU = process.env.APP_TZ ?? 'Asia/Jakarta'

const pemformatTanggal = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_WAKTU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Mengembalikan tanggal hari ini di zona aplikasi dengan format YYYY-MM-DD. */
export function tanggalJakarta(acuan: Date = new Date()): string {
  return pemformatTanggal.format(acuan)
}

/** Bulan berjalan dengan format YYYY-MM, dipakai untuk penanda pemeriksaan HB. */
export function bulanJakarta(acuan: Date = new Date()): string {
  return tanggalJakarta(acuan).slice(0, 7)
}

/** Tahun berjalan dengan format YYYY, dipakai untuk penanda ureum dan kreatinin. */
export function tahunJakarta(acuan: Date = new Date()): string {
  return tanggalJakarta(acuan).slice(0, 4)
}

/** Memastikan teks benar-benar tanggal kalender, bukan hanya cocok pola. */
export function tanggalValid(nilai: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nilai)) return false
  const [tahun, bulan, hari] = nilai.split('-').map(Number)
  if (tahun === undefined || bulan === undefined || hari === undefined) return false
  if (bulan < 1 || bulan > 12 || hari < 1 || hari > 31) return false
  const uji = new Date(Date.UTC(tahun, bulan - 1, hari))
  return (
    uji.getUTCFullYear() === tahun && uji.getUTCMonth() === bulan - 1 && uji.getUTCDate() === hari
  )
}

/** Tanggal masa depan tidak boleh dicatat karena sesi HD selalu sudah terjadi. */
export function tanggalMasaDepan(nilai: string, hariIni: string = tanggalJakarta()): boolean {
  return nilai > hariIni
}

/** Menambah atau mengurangi hari pada tanggal ISO tanpa terpengaruh zona waktu server. */
export function geserHari(nilai: string, jumlah: number): string {
  const [tahun, bulan, hari] = nilai.split('-').map(Number)
  const tanggal = new Date(Date.UTC(tahun ?? 1970, (bulan ?? 1) - 1, hari ?? 1))
  tanggal.setUTCDate(tanggal.getUTCDate() + jumlah)
  return tanggal.toISOString().slice(0, 10)
}

/** Menggeser bulan dengan pengaman akhir bulan, misalnya 31 Mar dikurangi 1 bulan menjadi 28/29 Feb. */
export function geserBulan(nilai: string, jumlah: number): string {
  const [tahun, bulan, hari] = nilai.split('-').map(Number)
  const dasar = new Date(Date.UTC(tahun ?? 1970, (bulan ?? 1) - 1 + jumlah, 1))
  const hariTerakhir = new Date(
    Date.UTC(dasar.getUTCFullYear(), dasar.getUTCMonth() + 1, 0),
  ).getUTCDate()
  const tanggal = Math.min(hari ?? 1, hariTerakhir)
  return new Date(Date.UTC(dasar.getUTCFullYear(), dasar.getUTCMonth(), tanggal))
    .toISOString()
    .slice(0, 10)
}

/** Rentang awal histori: tiga bulan terakhir, sesuai kebiasaan kontrol pasien HD. */
export function rentangTigaBulan(hariIni: string = tanggalJakarta()): {
  dari: string
  sampai: string
} {
  return { dari: geserBulan(hariIni, -3), sampai: hariIni }
}

/** Umur dihitung dari tanggal lahir agar tidak pernah basi seperti kolom umur. */
export function hitungUmur(tanggalLahir: string, acuan: string = tanggalJakarta()): number {
  const [tahunLahir, bulanLahir, hariLahir] = tanggalLahir.split('-').map(Number)
  const [tahunKini, bulanKini, hariKini] = acuan.split('-').map(Number)
  if (
    tahunLahir === undefined ||
    bulanLahir === undefined ||
    hariLahir === undefined ||
    tahunKini === undefined ||
    bulanKini === undefined ||
    hariKini === undefined
  ) {
    return 0
  }
  let umur = tahunKini - tahunLahir
  if (bulanKini < bulanLahir || (bulanKini === bulanLahir && hariKini < hariLahir)) {
    umur -= 1
  }
  return umur
}
