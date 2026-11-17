import 'server-only'
import { skemaLab, skemaLabPasangan, type JenisLabInput } from '../schema/lab'
import { uraiGalatZod } from '../schema/bantuan'
import { buatKlienServer } from '../supabase/server'
import type { HasilLab } from '../types/database'
import { berhasil, gagal, type Hasil } from '../util/hasil'
import { bulanJakarta, tahunJakarta } from '../util/tanggal'

/**
 * Pemeriksaan laboratorium dipisah dari sesi cuci darah karena tanggalnya
 * mandiri. HB dicatat sebulan sekali, ureum dan kreatinin setahun sekali.
 */

export interface DataLab {
  terbaru: Record<JenisLabInput, HasilLab | null>
  daftar: HasilLab[]
  status: {
    hbBulanIni: boolean
    ureumTahunIni: boolean
    kreatininTahunIni: boolean
  }
}

export async function ambilLab(pasienId: string): Promise<DataLab> {
  const supabase = await buatKlienServer()
  const { data } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', pasienId)
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(120)

  const daftar = data ?? []
  const terbaru: Record<JenisLabInput, HasilLab | null> = {
    hb: null,
    ureum: null,
    kreatinin: null,
  }

  // Daftar sudah terurut terbaru lebih dulu, jadi kemunculan pertama per jenis
  // adalah nilai yang paling baru.
  for (const baris of daftar) {
    if (terbaru[baris.jenis] === null) terbaru[baris.jenis] = baris
  }

  const bulanIni = bulanJakarta()
  const tahunIni = tahunJakarta()

  return {
    terbaru,
    daftar,
    status: {
      hbBulanIni: daftar.some(
        (baris) => baris.jenis === 'hb' && baris.tanggal.startsWith(bulanIni),
      ),
      ureumTahunIni: daftar.some(
        (baris) => baris.jenis === 'ureum' && baris.tanggal.startsWith(tahunIni),
      ),
      kreatininTahunIni: daftar.some(
        (baris) => baris.jenis === 'kreatinin' && baris.tanggal.startsWith(tahunIni),
      ),
    },
  }
}

/** Menyimpan satu nilai pemeriksaan, dipakai untuk HB. */
export async function simpanLab(pasienId: string, masukan: unknown): Promise<Hasil> {
  const uji = skemaLab.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { error } = await supabase.from('lab_results').insert({
    patient_id: pasienId,
    jenis: uji.data.jenis,
    nilai: uji.data.nilai,
    tanggal: uji.data.tanggal,
    catatan: uji.data.catatan,
  })

  if (error) return gagal({ umum: 'Hasil pemeriksaan gagal disimpan. Coba lagi.' })
  return berhasil(undefined)
}

/** Menyimpan ureum dan kreatinin dari satu sampel darah dalam satu kali simpan. */
export async function simpanLabPasangan(pasienId: string, masukan: unknown): Promise<Hasil> {
  const uji = skemaLabPasangan.safeParse(masukan)
  if (!uji.success) return gagal(uraiGalatZod(uji.error))

  const supabase = await buatKlienServer()
  const { error } = await supabase.from('lab_results').insert([
    {
      patient_id: pasienId,
      jenis: 'ureum',
      nilai: uji.data.ureum,
      tanggal: uji.data.tanggal,
      catatan: uji.data.catatan,
    },
    {
      patient_id: pasienId,
      jenis: 'kreatinin',
      nilai: uji.data.kreatinin,
      tanggal: uji.data.tanggal,
      catatan: uji.data.catatan,
    },
  ])

  if (error) return gagal({ umum: 'Hasil pemeriksaan gagal disimpan. Coba lagi.' })
  return berhasil(undefined)
}

export async function hapusLab(pasienId: string, labId: string): Promise<Hasil> {
  const supabase = await buatKlienServer()
  const { error } = await supabase
    .from('lab_results')
    .delete()
    .eq('id', labId)
    .eq('patient_id', pasienId)

  if (error) return gagal({ umum: 'Hasil pemeriksaan gagal dihapus. Coba lagi.' })
  return berhasil(undefined)
}
