import { z } from 'zod'
import { hitungUmur, tanggalMasaDepan } from '../util/tanggal'
import { angkaWajib, teksOpsional } from './bantuan'

/**
 * Skema profil dipakai di dua tempat: pendaftaran pasien dan penyuntingan profil.
 * Aturan username dibuat ketat supaya mudah diketik ulang dan tidak menimbulkan
 * kebingungan saat huruf besar/kecil dianggap sama.
 */

const ATURAN_USERNAME = /^[a-z0-9._]{3,30}$/

export const pesanUsername =
  'Username 3–30 karakter, hanya huruf kecil, angka, titik, dan garis bawah.'

export const skemaUsername = z.string().trim().regex(ATURAN_USERNAME, pesanUsername)

export const skemaEmail = z
  .email({ message: 'Format email tidak valid.' })
  .max(160, 'Email maksimal 160 karakter.')

export const skemaPassword = z
  .string()
  .min(8, 'Password minimal 8 karakter.')
  .regex(/[A-Za-z]/, 'Password harus memuat huruf.')
  .regex(/[0-9]/, 'Password harus memuat angka.')

const tanggalLahir = z.iso
  .date({ message: 'Tanggal lahir tidak valid.' })
  .refine((nilai) => !tanggalMasaDepan(nilai), 'Tanggal lahir tidak boleh di masa depan.')
  .refine((nilai) => {
    const umur = hitungUmur(nilai)
    return umur >= 1 && umur <= 120
  }, 'Umur harus antara 1 dan 120 tahun.')

export const skemaDaftar = z
  .object({
    nama: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter.')
      .max(80, 'Nama maksimal 80 karakter.'),
    email: skemaEmail,
    username: skemaUsername,
    password: skemaPassword,
    konfirmasi_password: z.string(),
    tanggal_lahir: tanggalLahir,
    alamat: z
      .string()
      .trim()
      .min(5, 'Alamat minimal 5 karakter.')
      .max(200, 'Alamat maksimal 200 karakter.'),
    bb_kering_kg: angkaWajib(20, 250, 'Berat badan kering'),
  })
  .refine((nilai) => nilai.password === nilai.konfirmasi_password, {
    message: 'Konfirmasi password tidak sama.',
    path: ['konfirmasi_password'],
  })

export type MasukanDaftar = z.infer<typeof skemaDaftar>

export const skemaUbahProfil = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80, 'Nama maksimal 80 karakter.'),
  username: skemaUsername,
  tanggal_lahir: tanggalLahir,
  alamat: z
    .string()
    .trim()
    .min(5, 'Alamat minimal 5 karakter.')
    .max(200, 'Alamat maksimal 200 karakter.'),
  bb_kering_kg: angkaWajib(20, 250, 'Berat badan kering'),
})

export type MasukanUbahProfil = z.infer<typeof skemaUbahProfil>

export const skemaUbahPassword = z
  .object({
    password_baru: skemaPassword,
    konfirmasi_password: z.string(),
  })
  .refine((nilai) => nilai.password_baru === nilai.konfirmasi_password, {
    message: 'Konfirmasi password tidak sama.',
    path: ['konfirmasi_password'],
  })

export type MasukanUbahPassword = z.infer<typeof skemaUbahPassword>

export const skemaMasuk = z.object({
  email: skemaEmail,
  password: z.string().min(1, 'Password wajib diisi.'),
})

export type MasukanMasuk = z.infer<typeof skemaMasuk>

export const skemaCatatanPasien = z.object({
  catatan: teksOpsional(500, 'Catatan'),
})
