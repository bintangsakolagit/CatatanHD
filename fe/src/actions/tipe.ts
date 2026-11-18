/** Status formulir yang dikembalikan Server Action ke komponen client. */
export type StatusForm = {
  galat?: Record<string, string>
  pesan?: string
  sukses?: boolean
  tautan?: string
  /**
   * Isian yang dikembalikan saat aksi gagal supaya formulir tidak kosong dan
   * pengguna tidak perlu mengetik ulang. Password sengaja tidak pernah ikut.
   */
  nilai?: Record<string, string>
  /**
   * Berubah setiap aksi gagal. Dipakai sebagai key formulir agar React memuat
   * ulang isian dengan nilai dari server, karena formulir dikosongkan otomatis
   * setelah Server Action selesai.
   */
  kunci?: number
}

export const STATUS_AWAL: StatusForm = {}
