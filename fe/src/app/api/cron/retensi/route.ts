import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { jalankanRetensi } from '@catatanhd/be/services/retensi'
import { opsionalEnv } from '@catatanhd/be/util/env'

/**
 * Endpoint retensi harian.
 *
 * Dipanggil oleh Netlify Scheduled Function (lihat netlify/functions/retensi.mts)
 * atau oleh cron eksternal. Tidak memakai sesi pengguna, jadi permintaan wajib
 * membawa rahasia yang sama dengan CRON_SECRET.
 *
 * Job ini menghapus akun pasien yang tidak masuk selama 3 bulan dan mengirim
 * peringatan pada sisa 30 hari serta 7 hari. Pekerjaan dibatasi per batch agar
 * selesai dalam batas waktu fungsi serverless.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

function rahasiaCocok(diterima: string | null): boolean {
  const diharapkan = opsionalEnv('CRON_SECRET')
  if (!diharapkan || !diterima) return false

  const a = Buffer.from(diterima)
  const b = Buffer.from(diharapkan)
  // timingSafeEqual menolak buffer berbeda panjang, jadi panjang dicek lebih dulu.
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

async function proses(request: NextRequest): Promise<NextResponse> {
  const dariHeader = request.headers.get('x-cron-secret')
  const dariBearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null

  if (!rahasiaCocok(dariHeader ?? dariBearer)) {
    return NextResponse.json({ ok: false, pesan: 'Tidak diizinkan.' }, { status: 401 })
  }

  const hasil = await jalankanRetensi()

  if (!hasil.ok) {
    return NextResponse.json({ ok: false, pesan: hasil.galat.umum }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...hasil.data })
}

export const GET = proses
export const POST = proses
