import { z } from 'zod'

/**
 * Mengubah daftar masalah zod menjadi peta "nama kolom -> pesan".
 * Hanya pesan pertama per kolom yang dipakai agar formulir tidak menumpuk galat.
 */
export function uraiGalatZod(error: z.ZodError): Record<string, string> {
  const hasil: Record<string, string> = {}
  for (const masalah of error.issues) {
    const kunci = masalah.path.length > 0 ? masalah.path.join('.') : 'umum'
    if (!hasil[kunci]) hasil[kunci] = masalah.message
  }
  return hasil
}

/** Kolom teks bebas yang boleh kosong; hasil kosong disimpan sebagai null. */
export function teksOpsional(maksimal: number, label: string) {
  return z
    .string()
    .trim()
    .max(maksimal, `${label} maksimal ${maksimal} karakter.`)
    .optional()
    .transform((nilai) => (nilai && nilai.length > 0 ? nilai : null))
}

/** Angka yang boleh dikosongkan, misalnya berat badan pasca cuci darah. */
export function angkaOpsional(minimal: number, maksimal: number, label: string) {
  return z
    .union([
      z.literal(''),
      z.coerce
        .number()
        .min(minimal, `${label} minimal ${minimal}.`)
        .max(maksimal, `${label} maksimal ${maksimal}.`),
    ])
    .optional()
    .transform((nilai) => (nilai === '' || nilai === undefined ? null : nilai))
}

/** Angka wajib dengan batas rentang yang masuk akal secara medis. */
export function angkaWajib(minimal: number, maksimal: number, label: string) {
  return z.coerce
    .number({ message: `${label} harus berupa angka.` })
    .min(minimal, `${label} minimal ${minimal}.`)
    .max(maksimal, `${label} maksimal ${maksimal}.`)
}

/** Angka bulat wajib, dipakai untuk tekanan darah dan nadi. */
export function angkaBulatWajib(minimal: number, maksimal: number, label: string) {
  return angkaWajib(minimal, maksimal, label).int(`${label} harus bilangan bulat.`)
}
