/**
 * Bentuk hasil seragam untuk seluruh service.
 * Server Action tinggal meneruskan `galat` ke formulir tanpa melempar exception
 * yang bisa membocorkan detail database ke pengguna.
 */

export type Hasil<T = undefined> =
  { ok: true; data: T } | { ok: false; galat: Record<string, string> }

export function berhasil<T>(data: T): Hasil<T> {
  return { ok: true, data }
}

export function gagal<T = never>(galat: Record<string, string>): Hasil<T> {
  return { ok: false, galat }
}
