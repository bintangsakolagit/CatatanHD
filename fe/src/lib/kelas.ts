/** Penggabung kelas sederhana, menggantikan dependensi tambahan. */
export function lk(...kelas: Array<string | false | null | undefined>): string {
  return kelas.filter(Boolean).join(' ')
}
