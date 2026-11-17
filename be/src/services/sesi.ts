import 'server-only'
import { skemaSesi, type MasukanSesi } from '../schema/sesi'
import { uraiGalatZod } from '../schema/bantuan'
import { buatKlienServer } from '../supabase/server'
import type { BacaanTensi, SesiDialisis } from '../types/database'
import { berhasil, gagal, type Hasil } from '../util/hasil'

/**
 * Service sesi cuci darah.
 * `pasienId` selalu berasal dari sesi login di server, bukan dari input browser.
 * RLS tetap menjadi pengaman kedua bila ada pemanggilan yang keliru.
 */

export interface SesiLengkap extends SesiDialisis {
  tensi: BacaanTensi[]
}

const KODE_UNIK = '23505'

function pesanGalatUmum(): Record<string, string> {
  return { umum: 'Catatan gagal disimpan. Coba lagi beberapa saat.' }
}

function ubahKeBarisSesi(data: MasukanSesi) {
  return {
    tanggal: data.tanggal,
    durasi_menit: data.durasi_menit,
    keluhan: data.keluhan,
    bb_kemarin_kg: data.bb_kemarin_kg,
    bb_pra_kg: data.bb_pra_kg,
    bb_pasca_kg: data.bb_pasca_kg,
    tensi_pra_sistolik: data.tensi_pra_sistolik,
    tensi_pra_diastolik: data.tensi_pra_diastolik,
    tensi_pasca_sistolik: data.tensi_pasca_sistolik,
    tensi_pasca_diastolik: data.tensi_pasca_diastolik,
    catatan: data.catatan,
  }
}

function ubahKeBarisTensi(sessionId: string, data: MasukanSesi) {
  return data.tensi.map((baca) => ({
    session_id: sessionId,
    jam: baca.jam,
    sistolik: baca.sistolik,
    diastolik: baca.diastolik,
    nadi: baca.nadi,
  }))
}

/** Menyimpan sesi baru beserta seluruh bacaan tensi berkala. */
export async function simpanSesi(
  pasienId: string,
  masukan: unknown,
): Promise<Hasil<{ id: string }>> {
  const uji = skemaSesi.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { data: sesi, error } = await supabase
    .from('dialysis_sessions')
    .insert({ patient_id: pasienId, ...ubahKeBarisSesi(uji.data) })
    .select('id')
    .single()

  if (error || !sesi) {
    if (error?.code === KODE_UNIK) {
      return gagal({
        tanggal: 'Sudah ada catatan untuk tanggal ini. Buka catatan tersebut untuk mengubahnya.',
      })
    }
    return gagal(pesanGalatUmum())
  }

  const barisTensi = ubahKeBarisTensi(sesi.id, uji.data)
  if (barisTensi.length > 0) {
    const { error: galatTensi } = await supabase.from('bp_readings').insert(barisTensi)
    if (galatTensi) {
      // Batalkan sesi agar tidak ada catatan tanpa tensi berkala yang tersimpan separuh.
      await supabase.from('dialysis_sessions').delete().eq('id', sesi.id)
      return gagal(pesanGalatUmum())
    }
  }

  return berhasil({ id: sesi.id })
}

/** Mengubah sesi yang sudah ada, termasuk mengganti seluruh bacaan tensi berkala. */
export async function ubahSesi(
  pasienId: string,
  sesiId: string,
  masukan: unknown,
): Promise<Hasil<{ id: string }>> {
  const uji = skemaSesi.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { data: sesi, error } = await supabase
    .from('dialysis_sessions')
    .update(ubahKeBarisSesi(uji.data))
    .eq('id', sesiId)
    .eq('patient_id', pasienId)
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === KODE_UNIK) {
      return gagal({ tanggal: 'Sudah ada catatan lain untuk tanggal ini.' })
    }
    return gagal(pesanGalatUmum())
  }
  if (!sesi) return gagal({ umum: 'Catatan tidak ditemukan.' })

  const { error: galatHapusTensi } = await supabase
    .from('bp_readings')
    .delete()
    .eq('session_id', sesiId)
  if (galatHapusTensi) return gagal(pesanGalatUmum())

  const barisTensi = ubahKeBarisTensi(sesiId, uji.data)
  if (barisTensi.length > 0) {
    const { error: galatTensi } = await supabase.from('bp_readings').insert(barisTensi)
    if (galatTensi) return gagal(pesanGalatUmum())
  }

  return berhasil({ id: sesiId })
}

/** Menghapus sesi; bacaan tensi ikut terhapus lewat foreign key cascade. */
export async function hapusSesi(pasienId: string, sesiId: string): Promise<Hasil> {
  const supabase = await buatKlienServer()
  const { error } = await supabase
    .from('dialysis_sessions')
    .delete()
    .eq('id', sesiId)
    .eq('patient_id', pasienId)

  if (error) return gagal(pesanGalatUmum())
  return berhasil(undefined)
}

/** Mengambil satu sesi lengkap dengan bacaan tensi, untuk halaman detail dan ubah. */
export async function ambilSesi(pasienId: string, sesiId: string): Promise<SesiLengkap | null> {
  const supabase = await buatKlienServer()
  const { data: sesi } = await supabase
    .from('dialysis_sessions')
    .select('*')
    .eq('id', sesiId)
    .eq('patient_id', pasienId)
    .maybeSingle()

  if (!sesi) return null

  const { data: tensi } = await supabase
    .from('bp_readings')
    .select('*')
    .eq('session_id', sesiId)
    .order('jam', { ascending: true })

  return { ...sesi, tensi: tensi ?? [] }
}

/** Sesi terakhir sebelum tanggal tertentu, dipakai untuk mengisi berat badan kemarin. */
export async function ambilSesiSebelum(
  pasienId: string,
  tanggal: string,
): Promise<Pick<SesiDialisis, 'tanggal' | 'bb_pasca_kg'> | null> {
  const supabase = await buatKlienServer()
  const { data } = await supabase
    .from('dialysis_sessions')
    .select('tanggal, bb_pasca_kg')
    .eq('patient_id', pasienId)
    .lt('tanggal', tanggal)
    .order('tanggal', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

/** Sesi paling baru, dipakai di beranda dan sebagai titik awal pengisian form. */
export async function ambilSesiTerakhir(pasienId: string): Promise<SesiDialisis | null> {
  const supabase = await buatKlienServer()
  const { data } = await supabase
    .from('dialysis_sessions')
    .select('*')
    .eq('patient_id', pasienId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

/** Pemeriksaan ringan untuk menandai apakah hari ini sudah dicatat. */
export async function adaSesiTanggal(pasienId: string, tanggal: string): Promise<boolean> {
  const supabase = await buatKlienServer()
  const { count } = await supabase
    .from('dialysis_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', pasienId)
    .eq('tanggal', tanggal)

  return (count ?? 0) > 0
}
