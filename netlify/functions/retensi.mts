/**
 * Netlify Scheduled Function: retensi data harian.
 *
 * Fungsi ini hanya menjadi pemicu. Seluruh aturan penghapusan dan peringatan
 * berada di route /api/cron/retensi agar bisa diuji dan dipanggil ulang secara
 * manual tanpa menunggu jadwal.
 *
 * Deploy preview dan build lokal dilewati supaya data produksi tidak tersentuh
 * saat pengujian.
 */

const situs =
  process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''

export default async function retensi(): Promise<void> {
  if (process.env.CONTEXT !== 'production') {
    console.log(`[retensi] Dilewati karena konteks "${process.env.CONTEXT ?? 'lokal'}".`)
    return
  }

  const rahasia = process.env.CRON_SECRET

  if (!situs || !rahasia) {
    console.error('[retensi] URL atau CRON_SECRET belum diatur pada environment Netlify.')
    return
  }

  const respons = await fetch(`${situs}/api/cron/retensi`, {
    method: 'POST',
    headers: { 'x-cron-secret': rahasia },
  })

  const isi = await respons.text()
  if (!respons.ok) {
    console.error(`[retensi] Gagal (${respons.status}): ${isi}`)
    return
  }

  console.log('[retensi] Selesai:', isi)
}

export const config = {
  schedule: '@daily',
}
