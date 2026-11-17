import 'server-only'
import { buatKlienServer } from '../supabase/server'
import type { SesiDialisis } from '../types/database'
import { rentangTigaBulan, tanggalJakarta } from '../util/tanggal'

/**
 * Histori menampilkan daftar sesi dan ringkasan angka pada rentang tanggal.
 * Ringkasan dihitung di database lewat fungsi `ringkasan_histori` supaya
 * halaman tetap ringan meskipun rentangnya satu tahun.
 */

export interface ParameterHistori {
  dari: string
  sampai: string
  halaman: number
  perHalaman: number
}

export interface RingkasanHistori {
  totalSesi: number
  rataTurunBb: number | null
  rataSistolikPra: number | null
  rataDiastolikPra: number | null
  durasiTersering: number | null
}

export interface DataHistori {
  daftar: SesiDialisis[]
  total: number
  ringkasan: RingkasanHistori
}

const PER_HALAMAN = 20

export function normalisasiParameter(mentah: {
  dari?: string
  sampai?: string
  halaman?: string
}): ParameterHistori {
  const bawaan = rentangTigaBulan()
  const dariValid = /^\d{4}-\d{2}-\d{2}$/.test(mentah.dari ?? '') ? mentah.dari! : bawaan.dari
  const sampaiValid = /^\d{4}-\d{2}-\d{2}$/.test(mentah.sampai ?? '')
    ? mentah.sampai!
    : bawaan.sampai

  // Rentang terbalik ditukar agar pengguna tidak melihat halaman kosong tanpa alasan.
  const dari = dariValid <= sampaiValid ? dariValid : sampaiValid
  const sampai = dariValid <= sampaiValid ? sampaiValid : dariValid

  const halaman = Math.max(1, Number.parseInt(mentah.halaman ?? '1', 10) || 1)

  return { dari, sampai, halaman, perHalaman: PER_HALAMAN }
}

export async function ambilHistori(
  pasienId: string,
  parameter: ParameterHistori,
): Promise<DataHistori> {
  const supabase = await buatKlienServer()
  const mulai = (parameter.halaman - 1) * parameter.perHalaman

  const [{ data: daftar, count }, { data: ringkas }] = await Promise.all([
    supabase
      .from('dialysis_sessions')
      .select('*', { count: 'exact' })
      .eq('patient_id', pasienId)
      .gte('tanggal', parameter.dari)
      .lte('tanggal', parameter.sampai)
      .order('tanggal', { ascending: false })
      .range(mulai, mulai + parameter.perHalaman - 1),
    supabase.rpc('ringkasan_histori', { p_dari: parameter.dari, p_sampai: parameter.sampai }),
  ])

  const baris = ringkas?.[0]

  return {
    daftar: daftar ?? [],
    total: count ?? 0,
    ringkasan: {
      totalSesi: Number(baris?.total_sesi ?? 0),
      rataTurunBb: baris?.rata_turun_bb ?? null,
      rataSistolikPra: baris?.rata_sistolik ?? null,
      rataDiastolikPra: baris?.rata_diastolik ?? null,
      durasiTersering: baris?.durasi_tersering ?? null,
    },
  }
}

/** Dipakai untuk ekspor CSV: mengambil seluruh sesi pada rentang tanpa pagination. */
export async function ambilSemuaSesi(
  pasienId: string,
  dari: string,
  sampai: string,
): Promise<SesiDialisis[]> {
  const supabase = await buatKlienServer()
  const { data } = await supabase
    .from('dialysis_sessions')
    .select('*')
    .eq('patient_id', pasienId)
    .gte('tanggal', dari)
    .lte('tanggal', sampai)
    .order('tanggal', { ascending: true })
    .limit(1000)

  return data ?? []
}

export interface RingkasanBeranda {
  sesiTerakhir: SesiDialisis | null
  totalBulanIni: number
  rataTurunBbBulanIni: number | null
  sudahCatatHariIni: boolean
}

/** Data ringkas untuk beranda: satu sesi terakhir, statistik bulan ini, status hari ini. */
export async function ambilRingkasanBeranda(pasienId: string): Promise<RingkasanBeranda> {
  const supabase = await buatKlienServer()
  const hariIni = tanggalJakarta()
  const awalBulan = `${hariIni.slice(0, 7)}-01`

  const [{ data: sesiTerakhir }, { data: ringkas }, { count: jumlahHariIni }] = await Promise.all([
    supabase
      .from('dialysis_sessions')
      .select('*')
      .eq('patient_id', pasienId)
      .order('tanggal', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc('ringkasan_histori', { p_dari: awalBulan, p_sampai: hariIni }),
    supabase
      .from('dialysis_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', pasienId)
      .eq('tanggal', hariIni),
  ])

  const baris = ringkas?.[0]

  return {
    sesiTerakhir: sesiTerakhir ?? null,
    totalBulanIni: Number(baris?.total_sesi ?? 0),
    rataTurunBbBulanIni: baris?.rata_turun_bb ?? null,
    sudahCatatHariIni: (jumlahHariIni ?? 0) > 0,
  }
}
