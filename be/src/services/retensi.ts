import 'server-only'
import { buatKlienAdmin } from '../supabase/admin'
import { berhasil, gagal, type Hasil } from '../util/hasil'
import { alamatAplikasi, kirimEmail } from './email'

/**
 * Retensi data.
 *
 * Aturan yang disepakati: akun pasien yang tidak masuk selama tiga bulan
 * dihapus bersama seluruh catatannya. Peringatan dikirim pada hari ke-30 dan
 * hari ke-7 sebelum penghapusan. Super admin dan akun nonaktif tidak ikut.
 *
 * Job dijalankan bertahap (maksimal 50 akun per panggilan) agar tidak melewati
 * batas waktu fungsi serverless.
 */

const BATAS_PER_JALAN = 20
const BATAS_HAPUS_HARI = 90
/** Peringatan pertama dikirim saat sisa 30 hari, yaitu pada hari ke-60 tidak aktif. */
const PERINGATAN_PERTAMA_HARI = 60
/** Peringatan terakhir dikirim saat sisa 7 hari, yaitu pada hari ke-83 tidak aktif. */
const PERINGATAN_KEDUA_HARI = 83

export interface HasilRetensi {
  diperiksa: number
  dihapus: number
  peringatanH30: number
  peringatanH7: number
}

function isiEmailPeringatan(nama: string, sisaHari: number): { subjek: string; html: string } {
  const tautan = `${alamatAplikasi()}/masuk`
  return {
    subjek:
      sisaHari <= 7
        ? 'CatatanHD: data dihapus dalam 7 hari'
        : 'CatatanHD: data dihapus dalam 30 hari',
    html: `<p>Halo ${nama},</p>
<p>Akun CatatanHD Anda belum dipakai untuk masuk. Sesuai aturan aplikasi, akun dan seluruh catatan cuci darah akan dihapus dalam <strong>${sisaHari} hari</strong> bila tidak ada aktivitas masuk.</p>
<p>Masuk ke aplikasi untuk mempertahankan catatan Anda:</p>
<p><a href="${tautan}">Buka CatatanHD</a></p>
<p>Jika Anda memang tidak membutuhkan catatan ini, tidak ada yang perlu dilakukan.</p>`,
  }
}

export async function jalankanRetensi(): Promise<Hasil<HasilRetensi>> {
  const admin = buatKlienAdmin()

  const { data: kandidat, error } = await admin.rpc('cari_akun_pasif', { batas: BATAS_PER_JALAN })
  if (error) {
    console.error('[retensi] Gagal mengambil daftar akun pasif:', error.message)
    return gagal({ umum: 'Daftar akun pasif gagal dibaca.' })
  }

  const hasil: HasilRetensi = {
    diperiksa: kandidat?.length ?? 0,
    dihapus: 0,
    peringatanH30: 0,
    peringatanH7: 0,
  }

  for (const akun of kandidat ?? []) {
    // 1) Sudah lewat tiga bulan: hapus akun dan seluruh data terkait.
    if (akun.hari >= BATAS_HAPUS_HARI) {
      const { error: galatHapus } = await admin.auth.admin.deleteUser(akun.id)
      if (galatHapus) {
        console.error('[retensi] Gagal menghapus akun', akun.id, galatHapus.message)
        continue
      }
      hasil.dihapus += 1
      await admin.from('audit_logs').insert({
        aktor_id: null,
        aksi: 'retensi_hapus',
        target_id: akun.id,
        detail: { hari: akun.hari, email: akun.email },
      })
      continue
    }

    // 2) Belum tiga bulan: kirim peringatan sesuai tahap, satu kali per tahap.
    const tahap =
      akun.hari >= PERINGATAN_KEDUA_HARI
        ? 'h7'
        : akun.hari >= PERINGATAN_PERTAMA_HARI
          ? 'h30'
          : null

    if (!tahap) continue

    const { data: sudahDikirim } = await admin
      .from('retention_notices')
      .select('id')
      .eq('patient_id', akun.id)
      .eq('tahap', tahap)
      .maybeSingle()

    if (sudahDikirim) continue

    const sisaHari = BATAS_HAPUS_HARI - akun.hari
    const isi = isiEmailPeringatan(akun.nama ?? 'Pasien', sisaHari)
    const terkirim = await kirimEmail({
      ke: akun.email ?? '',
      subjek: isi.subjek,
      html: isi.html,
    })

    // Email yang gagal tidak dicatat, sehingga percobaan berikutnya mengirim ulang.
    if (!terkirim.ok) continue

    await admin.from('retention_notices').insert({ patient_id: akun.id, tahap })
    if (tahap === 'h30') hasil.peringatanH30 += 1
    else hasil.peringatanH7 += 1
  }

  return berhasil(hasil)
}
