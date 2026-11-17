import { NextResponse, type NextRequest } from 'next/server'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { ambilSemuaSesi } from '@catatanhd/be/services/histori'
import { tanggalJakarta } from '@catatanhd/be/util/tanggal'

/** Membungkus nilai agar aman di CSV, termasuk tanda kutip dan pemisah. */
function sel(nilai: unknown): string {
  const teks = nilai === null || nilai === undefined ? '' : String(nilai)
  return `"${teks.replace(/"/g, '""')}"`
}

function validTanggal(nilai: string | null, cadangan: string): string {
  return nilai && /^\d{4}-\d{2}-\d{2}$/.test(nilai) ? nilai : cadangan
}

/**
 * Ekspor CSV untuk rentang tanggal.
 * Pemisah memakai titik koma agar langsung rapi saat dibuka di Excel
 * dengan pengaturan regional Indonesia, dan BOM ditambahkan agar huruf
 * beraksen tidak rusak.
 */
export async function GET(request: NextRequest) {
  const sesi = await wajibLogin()
  const hariIni = tanggalJakarta()
  const dari = validTanggal(request.nextUrl.searchParams.get('dari'), hariIni)
  const sampai = validTanggal(request.nextUrl.searchParams.get('sampai'), hariIni)

  const daftar = await ambilSemuaSesi(sesi.id, dari, sampai)

  const judul = [
    'Tanggal',
    'Durasi (menit)',
    'BB kemarin (kg)',
    'BB sebelum (kg)',
    'BB sesudah (kg)',
    'Turun (kg)',
    'Tensi sebelum',
    'Tensi sesudah',
    'Keluhan',
    'Catatan',
  ]

  const baris = daftar.map((item) => {
    const turun =
      item.bb_pasca_kg === null ? '' : Math.round((item.bb_pra_kg - item.bb_pasca_kg) * 10) / 10

    return [
      item.tanggal,
      item.durasi_menit,
      item.bb_kemarin_kg,
      item.bb_pra_kg,
      item.bb_pasca_kg,
      turun,
      `${item.tensi_pra_sistolik}/${item.tensi_pra_diastolik}`,
      item.tensi_pasca_sistolik && item.tensi_pasca_diastolik
        ? `${item.tensi_pasca_sistolik}/${item.tensi_pasca_diastolik}`
        : '',
      item.keluhan ?? '',
      item.catatan ?? '',
    ]
      .map(sel)
      .join(';')
  })

  const isi = `\uFEFF${judul.map(sel).join(';')}\n${baris.join('\n')}\n`
  const namaBerkas = `catatanhd-${dari}-sampai-${sampai}.csv`

  return new NextResponse(isi, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${namaBerkas}"`,
      'Cache-Control': 'no-store',
    },
  })
}
