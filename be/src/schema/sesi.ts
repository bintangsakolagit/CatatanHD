import { z } from 'zod'
import { DAFTAR_DURASI, durasiValid } from '../util/durasi'
import { tanggalMasaDepan } from '../util/tanggal'
import { angkaBulatWajib, angkaOpsional, angkaWajib, teksOpsional } from './bantuan'

/**
 * Satu sesi cuci darah punya satu catatan utama dan banyak bacaan tensi berkala.
 * Semua aturan di sini dipakai server, jadi data tidak bisa lolos hanya dengan
 * mematikan validasi di browser.
 */

export const skemaTensiBerkala = z.object({
  jam: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jam harus berformat HH:MM, misalnya 09:30.'),
  sistolik: angkaBulatWajib(50, 300, 'Tensi sistolik'),
  diastolik: angkaBulatWajib(30, 200, 'Tensi diastolik'),
  nadi: angkaOpsional(20, 250, 'Nadi'),
})

export type TensiBerkala = z.infer<typeof skemaTensiBerkala>

const pesanDurasi = `Durasi harus salah satu dari: ${DAFTAR_DURASI.map((menit) => `${menit} menit`).join(', ')}.`

export const skemaSesi = z
  .object({
    tanggal: z.iso.date({ message: 'Tanggal cuci darah tidak valid.' }),
    durasi_menit: z.coerce
      .number({ message: 'Durasi cuci darah wajib dipilih.' })
      .refine((nilai) => durasiValid(nilai), pesanDurasi),
    keluhan: teksOpsional(500, 'Keluhan sebelum cuci darah'),
    bb_kemarin_kg: angkaOpsional(20, 250, 'Berat badan sesi kemarin'),
    bb_pra_kg: angkaWajib(20, 250, 'Berat badan sebelum cuci darah'),
    bb_pasca_kg: angkaOpsional(20, 250, 'Berat badan setelah cuci darah'),
    tensi_pra_sistolik: angkaBulatWajib(50, 300, 'Tensi sistolik sebelum cuci darah'),
    tensi_pra_diastolik: angkaBulatWajib(30, 200, 'Tensi diastolik sebelum cuci darah'),
    tensi_pasca_sistolik: angkaOpsional(50, 300, 'Tensi sistolik setelah cuci darah'),
    tensi_pasca_diastolik: angkaOpsional(30, 200, 'Tensi diastolik setelah cuci darah'),
    catatan: teksOpsional(1000, 'Catatan selama cuci darah'),
    tensi: z
      .array(skemaTensiBerkala)
      .max(24, 'Maksimal 24 pemeriksaan tensi per sesi.')
      .default([]),
  })
  .superRefine((nilai, konteks) => {
    if (tanggalMasaDepan(nilai.tanggal)) {
      konteks.addIssue({
        code: 'custom',
        path: ['tanggal'],
        message: 'Tanggal cuci darah tidak boleh di masa depan.',
      })
    }

    if (nilai.tensi_pra_sistolik <= nilai.tensi_pra_diastolik) {
      konteks.addIssue({
        code: 'custom',
        path: ['tensi_pra_sistolik'],
        message: 'Tensi sistolik harus lebih besar dari diastolik.',
      })
    }

    const adaPascaSistolik = nilai.tensi_pasca_sistolik !== null
    const adaPascaDiastolik = nilai.tensi_pasca_diastolik !== null
    if (adaPascaSistolik !== adaPascaDiastolik) {
      konteks.addIssue({
        code: 'custom',
        path: ['tensi_pasca_sistolik'],
        message: 'Isi tensi sistolik dan diastolik setelah cuci darah secara lengkap.',
      })
    }

    if (
      nilai.tensi_pasca_sistolik !== null &&
      nilai.tensi_pasca_diastolik !== null &&
      nilai.tensi_pasca_sistolik <= nilai.tensi_pasca_diastolik
    ) {
      konteks.addIssue({
        code: 'custom',
        path: ['tensi_pasca_sistolik'],
        message: 'Tensi sistolik harus lebih besar dari diastolik.',
      })
    }

    nilai.tensi.forEach((baca, indeks) => {
      if (baca.sistolik <= baca.diastolik) {
        konteks.addIssue({
          code: 'custom',
          path: ['tensi', indeks, 'sistolik'],
          message: 'Tensi sistolik harus lebih besar dari diastolik.',
        })
      }
    })
  })

export type MasukanSesi = z.infer<typeof skemaSesi>
