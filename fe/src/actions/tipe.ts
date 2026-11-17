/** Status formulir yang dikembalikan Server Action ke komponen client. */
export type StatusForm = {
  galat?: Record<string, string>
  pesan?: string
  sukses?: boolean
  tautan?: string
}

export const STATUS_AWAL: StatusForm = {}
