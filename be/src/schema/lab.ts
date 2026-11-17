import { z } from 'zod'
import { tanggalMasaDepan } from '../util/tanggal'
import { angkaWajib, teksOpsional } from './bantuan'

/**
 * Hasil laboratorium dicatat terpisah dari sesi cuci darah karena jadwalnya
 * berbeda: HB sebulan sekali, ureum dan kreatinin setahun sekali.
 */

export const JENIS_LAB = ['hb', 'ureum', 'kreatinin'] as const

export type JenisLabInput = (typeof JENIS_LAB)[number]

export const LABEL_LAB: Record<JenisLabInput, string> = {
  hb: 'Hemoglobin (HB)',
  ureum: 'Ureum',
  kreatinin: 'Kreatinin',
}

export const SATUAN_LAB: Record<JenisLabInput, string> = {
  hb: 'g/dL',
  ureum: 'mg/dL',
  kreatinin: 'mg/dL',
}

const tanggalLab = z.iso
  .date({ message: 'Tanggal pemeriksaan tidak valid.' })
  .refine((nilai) => !tanggalMasaDepan(nilai), 'Tanggal pemeriksaan tidak boleh di masa depan.')

export const skemaLab = z.object({
  jenis: z.enum(JENIS_LAB, { message: 'Jenis pemeriksaan tidak dikenali.' }),
  tanggal: tanggalLab,
  nilai: angkaWajib(0.01, 9999, 'Nilai pemeriksaan'),
  catatan: teksOpsional(200, 'Catatan'),
})

export type MasukanLab = z.infer<typeof skemaLab>

/** Ureum dan kreatinin diambil dari satu sampel darah, jadi dicatat berpasangan. */
export const skemaLabPasangan = z.object({
  tanggal: tanggalLab,
  ureum: angkaWajib(0.01, 9999, 'Ureum'),
  kreatinin: angkaWajib(0.01, 9999, 'Kreatinin'),
  catatan: teksOpsional(200, 'Catatan'),
})

export type MasukanLabPasangan = z.infer<typeof skemaLabPasangan>
