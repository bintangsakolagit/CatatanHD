import { lk } from '@/lib/kelas'

/**
 * Kumpulan ikon garis bawaan aplikasi.
 * Sengaja ditulis sebagai SVG sebaris agar tidak menambah dependensi dan
 * ikut berubah warna mengikuti teks di sekitarnya.
 */
export type NamaIkon =
  | 'beranda'
  | 'histori'
  | 'lab'
  | 'profil'
  | 'pengguna'
  | 'tambah'
  | 'tetes'
  | 'matahari'
  | 'bulan'
  | 'kembali'
  | 'lanjut'
  | 'periksa'
  | 'silang'
  | 'peringatan'
  | 'info'
  | 'hapus'
  | 'cetak'
  | 'unduh'
  | 'kalender'
  | 'timbangan'
  | 'jantung'
  | 'catatan'
  | 'keluar'
  | 'kunci'
  | 'perisai'
  | 'jam'

const JALUR: Record<NamaIkon, string[]> = {
  beranda: ['M3 10.7 12 3.5l9 7.2', 'M5.5 9.6V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.6'],
  histori: [
    'M3.6 11.2A8.4 8.4 0 1 1 12 20.4a8.3 8.3 0 0 1-5.4-2',
    'M3 4.6v5.2h5.2',
    'M12 7.8v4.8l3.2 1.9',
  ],
  lab: [
    'M9.4 3h5.2',
    'M10.3 3v5.6l-5.1 9A1.9 1.9 0 0 0 6.9 21h10.2a1.9 1.9 0 0 0 1.7-3.4l-5.1-9V3',
    'M7.6 15.4h8.8',
  ],
  profil: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 20.4a7.5 7.5 0 0 1 15 0'],
  pengguna: [
    'M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Z',
    'M2.8 19.4a6.2 6.2 0 0 1 12.4 0',
    'M16.5 5.2a3 3 0 0 1 0 5.6',
    'M18 13.6a5.6 5.6 0 0 1 3.2 5',
  ],
  tambah: ['M12 5v14', 'M5 12h14'],
  tetes: ['M12 3.2s5.8 6.1 5.8 10.1a5.8 5.8 0 0 1-11.6 0C6.2 9.3 12 3.2 12 3.2Z'],
  matahari: [
    'M12 16.4a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Z',
    'M12 2v2.2',
    'M12 19.8V22',
    'M4.9 4.9l1.6 1.6',
    'M17.5 17.5l1.6 1.6',
    'M2 12h2.2',
    'M19.8 12H22',
    'M4.9 19.1l1.6-1.6',
    'M17.5 6.5l1.6-1.6',
  ],
  bulan: ['M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a6.7 6.7 0 0 0 10.8 10.8Z'],
  kembali: ['M19 12H5', 'M11.5 18 5 12l6.5-6'],
  lanjut: ['M5 12h14', 'M12.5 6 19 12l-6.5 6'],
  periksa: ['M20 6.5 9.4 17 4 11.7'],
  silang: ['M6 6l12 12', 'M18 6 6 18'],
  peringatan: [
    'M12 3.6 2.9 19.4a1 1 0 0 0 .9 1.5h16.4a1 1 0 0 0 .9-1.5L12 3.6Z',
    'M12 9.4v4.4',
    'M12 17.1h.01',
  ],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5.2', 'M12 7.6h.01'],
  hapus: [
    'M4 7h16',
    'M9.5 7V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7',
    'M6.5 7 7.4 20a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1L17.5 7',
    'M10.2 11v6',
    'M13.8 11v6',
  ],
  cetak: [
    'M7 8.5V3.6h10v4.9',
    'M7 18H5.2A1.2 1.2 0 0 1 4 16.8v-6.1a1.2 1.2 0 0 1 1.2-1.2h13.6A1.2 1.2 0 0 1 20 10.7v6.1a1.2 1.2 0 0 1-1.2 1.2H17',
    'M7 14.6h10V21H7z',
  ],
  unduh: ['M12 3.6v11.2', 'M7.4 10.4 12 15l4.6-4.6', 'M4 18.4v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1'],
  kalender: [
    'M4.5 6.2h15a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z',
    'M8 3.4v5',
    'M16 3.4v5',
    'M3.5 11h17',
  ],
  timbangan: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 12 15.8 8', 'M12 12h.01'],
  jantung: [
    'M20.3 6.6a4.8 4.8 0 0 0-6.8 0L12 8.1l-1.5-1.5a4.8 4.8 0 1 0-6.8 6.8L12 21l1.5-1.5',
    'M3.5 12.2h4l1.6-3 2.4 6 1.8-3h6.4',
  ],
  catatan: [
    'M6.5 3.4h8l4.5 4.5v12a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z',
    'M14.2 3.6v4.6h4.6',
    'M8.8 12h6.4',
    'M8.8 16h4.4',
  ],
  keluar: [
    'M14.5 8V5.5a1 1 0 0 0-1-1H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V16',
    'M9.5 12h11',
    'M17.4 8.9l3.1 3.1-3.1 3.1',
  ],
  kunci: [
    'M6.5 10.4h11a1 1 0 0 1 1 1v8.2a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8.2a1 1 0 0 1 1-1Z',
    'M8.5 10.4V7.6a3.5 3.5 0 0 1 7 0v2.8',
  ],
  perisai: [
    'M12 3 5 5.8v5.6c0 4.4 2.9 7.4 7 9.6 4.1-2.2 7-5.2 7-9.6V5.8L12 3Z',
    'M9.2 12.1l2 2 3.6-3.7',
  ],
  jam: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.6v4.9l3.3 2'],
}

/** Ikon dekoratif; teks pendamping tetap disediakan di luar komponen ini. */
export function Ikon({
  nama,
  className,
  tebal = 1.8,
}: {
  nama: NamaIkon
  className?: string
  tebal?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={tebal}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={lk('h-5 w-5 shrink-0', className)}
    >
      {JALUR[nama].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

/** Logo tetes air di dalam kotak gradien, dipakai pada kepala halaman. */
export function LogoCatatan({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={lk(
        'gradien-tetes inline-flex h-9 w-9 items-center justify-center rounded-[13px] text-white shadow-lembut',
        className,
      )}
    >
      <Ikon nama="tetes" className="h-5 w-5" tebal={2} />
    </span>
  )
}
