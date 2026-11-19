import { DAFTAR_DURASI } from '@catatanhd/be/util/durasi'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'

/**
 * Aturan tampilan formulir sesi tiga tahap.
 *
 * Validasi lengkap tetap dijalankan server. Fungsi di sini hanya memeriksa
 * tahap yang sedang dibuka agar pasien tidak dipindahkan ke langkah berikutnya
 * dengan isian wajib yang masih kosong.
 */

export type NomorTahap = 1 | 2 | 3
export type GalatLokal = Record<string, string>

export interface NilaiTensi {
  jam: string
  sistolik: string
  diastolik: string
  nadi: string
}

export interface NilaiSesi {
  tanggal: string
  durasi_menit: string
  keluhan: string
  bb_kemarin_kg: string
  bb_pra_kg: string
  bb_pasca_kg: string
  tensi_pra_sistolik: string
  tensi_pra_diastolik: string
  tensi_pasca_sistolik: string
  tensi_pasca_diastolik: string
  catatan: string
  tensi: NilaiTensi[]
}

export interface Tahap {
  nomor: NomorTahap
  pendek: string
  judul: string
  keterangan: string
}

export const TAHAP_SESI: Tahap[] = [
  {
    nomor: 1,
    pendek: 'Sebelum',
    judul: 'Sebelum cuci darah',
    keterangan: 'Tanggal, berat badan, dan tensi saat baru sampai di unit.',
  },
  {
    nomor: 2,
    pendek: 'Selama',
    judul: 'Selama cuci darah',
    keterangan: 'Tensi berkala dan hal yang dirasakan selama proses.',
  },
  {
    nomor: 3,
    pendek: 'Setelah',
    judul: 'Setelah cuci darah',
    keterangan: 'Berat badan dan tensi sebelum pulang.',
  },
]

/** Kolom server yang galatnya harus ditampilkan pada tahap tertentu. */
const KOLOM_TAHAP: Record<string, NomorTahap> = {
  tanggal: 1,
  durasi_menit: 1,
  keluhan: 1,
  bb_kemarin_kg: 1,
  bb_pra_kg: 1,
  tensi_pra_sistolik: 1,
  tensi_pra_diastolik: 1,
  tensi: 2,
  catatan: 2,
  bb_pasca_kg: 3,
  tensi_pasca_sistolik: 3,
  tensi_pasca_diastolik: 3,
}

/** Menentukan tahap yang perlu dibuka saat server mengembalikan galat. */
export function tahapUntukGalat(galat?: Record<string, string> | null): NomorTahap | null {
  if (!galat) return null

  for (const kunci of Object.keys(galat)) {
    if (kunci === 'umum') continue
    const akar = kunci.split('.')[0] ?? kunci
    const tahap = KOLOM_TAHAP[akar]
    if (tahap) return tahap
  }

  return null
}

function keAngka(nilai: string): number | null {
  const teks = nilai.trim().replace(',', '.')
  if (teks === '') return null
  const angka = Number(teks)
  return Number.isFinite(angka) ? angka : null
}

function periksaAngka(
  galat: GalatLokal,
  kunci: string,
  nilai: string,
  label: string,
  minimal: number,
  maksimal: number,
  wajib = false,
): number | null {
  if (nilai.trim() === '') {
    if (wajib) galat[kunci] = `${label} wajib diisi.`
    return null
  }

  const angka = keAngka(nilai)
  if (angka === null) {
    galat[kunci] = `${label} harus berupa angka.`
    return null
  }
  if (angka < minimal || angka > maksimal) {
    galat[kunci] = `${label} harus antara ${minimal} dan ${maksimal}.`
    return null
  }
  return angka
}

/** Memvalidasi hanya kolom yang terlihat pada tahap yang dipilih. */
export function periksaTahap(
  tahap: NomorTahap,
  nilai: NilaiSesi,
  hariIni: string = tanggalJakarta(),
): GalatLokal {
  const galat: GalatLokal = {}

  if (tahap === 1) {
    if (nilai.tanggal.trim() === '') {
      galat.tanggal = 'Tanggal cuci darah wajib diisi.'
    } else if (nilai.tanggal > hariIni) {
      galat.tanggal = 'Tanggal cuci darah tidak boleh di masa depan.'
    }

    const durasi = Number(nilai.durasi_menit)
    if (!(DAFTAR_DURASI as readonly number[]).includes(durasi)) {
      galat.durasi_menit = 'Lama cuci darah wajib dipilih.'
    }

    periksaAngka(galat, 'bb_kemarin_kg', nilai.bb_kemarin_kg, 'Berat badan sesi kemarin', 20, 250)
    periksaAngka(
      galat,
      'bb_pra_kg',
      nilai.bb_pra_kg,
      'Berat badan sebelum cuci darah',
      20,
      250,
      true,
    )

    const sistolik = periksaAngka(
      galat,
      'tensi_pra_sistolik',
      nilai.tensi_pra_sistolik,
      'Tensi sistolik sebelum cuci darah',
      50,
      300,
      true,
    )
    const diastolik = periksaAngka(
      galat,
      'tensi_pra_diastolik',
      nilai.tensi_pra_diastolik,
      'Tensi diastolik sebelum cuci darah',
      30,
      200,
      true,
    )
    if (
      sistolik !== null &&
      diastolik !== null &&
      sistolik <= diastolik &&
      !galat.tensi_pra_sistolik
    ) {
      galat.tensi_pra_sistolik = 'Tensi sistolik harus lebih besar dari diastolik.'
    }
  }

  if (tahap === 2) {
    const pesan = periksaBarisTensi(nilai.tensi)
    if (pesan) galat.tensi = pesan
  }

  if (tahap === 3) {
    periksaAngka(galat, 'bb_pasca_kg', nilai.bb_pasca_kg, 'Berat badan setelah cuci darah', 20, 250)

    const sistolik = periksaAngka(
      galat,
      'tensi_pasca_sistolik',
      nilai.tensi_pasca_sistolik,
      'Tensi sistolik setelah cuci darah',
      50,
      300,
    )
    const diastolik = periksaAngka(
      galat,
      'tensi_pasca_diastolik',
      nilai.tensi_pasca_diastolik,
      'Tensi diastolik setelah cuci darah',
      30,
      200,
    )

    const sistolikKosong = nilai.tensi_pasca_sistolik.trim() === ''
    const diastolikKosong = nilai.tensi_pasca_diastolik.trim() === ''
    if (sistolikKosong !== diastolikKosong) {
      galat.tensi_pasca_sistolik =
        'Isi tensi sistolik dan diastolik setelah cuci darah secara lengkap.'
    } else if (
      sistolik !== null &&
      diastolik !== null &&
      sistolik <= diastolik &&
      !galat.tensi_pasca_sistolik
    ) {
      galat.tensi_pasca_sistolik = 'Tensi sistolik harus lebih besar dari diastolik.'
    }
  }

  return galat
}

/** Baris yang semua kolomnya kosong dianggap belum diisi dan dilewati. */
function periksaBarisTensi(baris: NilaiTensi[]): string | null {
  if (baris.length > 24) return 'Maksimal 24 pemeriksaan tensi per sesi.'

  for (const [indeks, baca] of baris.entries()) {
    const nomor = indeks + 1
    const kosong =
      baca.jam.trim() === '' &&
      baca.sistolik.trim() === '' &&
      baca.diastolik.trim() === '' &&
      baca.nadi.trim() === ''

    if (kosong) continue

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(baca.jam)) {
      return `Pemeriksaan ${nomor}: jam wajib diisi dengan format HH:MM.`
    }

    const sistolik = keAngka(baca.sistolik)
    const diastolik = keAngka(baca.diastolik)

    if (sistolik === null || sistolik < 50 || sistolik > 300) {
      return `Pemeriksaan ${nomor}: tensi sistolik harus antara 50 dan 300.`
    }
    if (diastolik === null || diastolik < 30 || diastolik > 200) {
      return `Pemeriksaan ${nomor}: tensi diastolik harus antara 30 dan 200.`
    }
    if (sistolik <= diastolik) {
      return `Pemeriksaan ${nomor}: tensi sistolik harus lebih besar dari diastolik.`
    }

    if (baca.nadi.trim() !== '') {
      const nadi = keAngka(baca.nadi)
      if (nadi === null || nadi < 20 || nadi > 250) {
        return `Pemeriksaan ${nomor}: nadi harus antara 20 dan 250.`
      }
    }
  }

  return null
}
