import 'server-only'
import { buatKlienAdmin } from '../supabase/admin'
import type { HasilLab, Profil } from '../types/database'
import { berhasil, gagal, type Hasil } from '../util/hasil'
import { alamatAplikasi, kirimEmail } from './email'

/**
 * Panel super admin.
 * Seluruh fungsi di sini memakai service role, jadi setiap pemanggil wajib
 * melewati `wajibAdmin()` lebih dulu. Service role tidak dibatasi RLS.
 */

const PER_HALAMAN = 20

export interface DataDaftarPengguna {
  daftar: Profil[]
  total: number
  halaman: number
  totalHalaman: number
}

export interface DetailPengguna {
  profil: Profil
  jumlahSesi: number
  sesiTerakhir: { tanggal: string; bb_pra_kg: number; bb_pasca_kg: number | null } | null
  labTerbaru: HasilLab[]
}

/** Membersihkan karakter yang punya arti khusus pada filter PostgREST. */
function bersihkanKataKunci(nilai: string): string {
  return nilai
    .replace(/[,%()*\\]/g, ' ')
    .trim()
    .slice(0, 80)
}

export async function daftarPengguna(parameter: {
  cari?: string
  halaman?: number
}): Promise<DataDaftarPengguna> {
  const admin = buatKlienAdmin()
  const cari = bersihkanKataKunci(parameter.cari ?? '')
  const halaman = Math.max(1, parameter.halaman ?? 1)
  const mulai = (halaman - 1) * PER_HALAMAN

  let kueri = admin.from('profiles').select('*', { count: 'exact' }).eq('role', 'pasien')

  if (cari.length > 0) {
    const pola = `%${cari}%`
    kueri = kueri.or(`nama.ilike.${pola},username.ilike.${pola},email.ilike.${pola}`)
  }

  const { data, count, error } = await kueri
    .order('created_at', { ascending: false })
    .range(mulai, mulai + PER_HALAMAN - 1)

  const total = count ?? 0

  return {
    daftar: error ? [] : (data ?? []),
    total,
    halaman,
    totalHalaman: Math.max(1, Math.ceil(total / PER_HALAMAN)),
  }
}

export async function detailPengguna(pasienId: string): Promise<DetailPengguna | null> {
  const admin = buatKlienAdmin()

  const [{ data: profil }, { count: jumlahSesi }, { data: sesiTerakhir }, { data: labTerbaru }] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', pasienId).eq('role', 'pasien').maybeSingle(),
      admin
        .from('dialysis_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', pasienId),
      admin
        .from('dialysis_sessions')
        .select('tanggal, bb_pra_kg, bb_pasca_kg')
        .eq('patient_id', pasienId)
        .order('tanggal', { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from('lab_results')
        .select('*')
        .eq('patient_id', pasienId)
        .order('tanggal', { ascending: false })
        .limit(6),
    ])

  if (!profil) return null

  return {
    profil,
    jumlahSesi: jumlahSesi ?? 0,
    sesiTerakhir: sesiTerakhir ?? null,
    labTerbaru: labTerbaru ?? [],
  }
}

/** Mencatat aksi admin agar perubahan status dan penghapusan akun bisa ditelusuri. */
async function catatAudit(
  aktorId: string,
  aksi: string,
  targetId: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  const admin = buatKlienAdmin()
  await admin.from('audit_logs').insert({
    aktor_id: aktorId,
    aksi,
    target_id: targetId,
    detail,
  })
}

export async function ubahStatusPengguna(
  pasienId: string,
  aktif: boolean,
  aktorId: string,
): Promise<Hasil> {
  const admin = buatKlienAdmin()
  const { error } = await admin.from('profiles').update({ is_active: aktif }).eq('id', pasienId)

  if (error) return gagal({ umum: 'Status akun gagal diubah. Coba lagi.' })

  await catatAudit(aktorId, aktif ? 'aktifkan_akun' : 'nonaktifkan_akun', pasienId)
  return berhasil(undefined)
}

/**
 * Reset password dikirim sebagai tautan resmi Supabase, bukan password sementara
 * yang diketik admin. Tautan juga dikembalikan agar bisa diteruskan lewat
 * WhatsApp bila email pasien tidak aktif.
 */
export async function resetPasswordPengguna(
  pasienId: string,
  aktorId: string,
): Promise<Hasil<{ terkirim: boolean; tautan: string | null }>> {
  const admin = buatKlienAdmin()
  const { data: profil } = await admin
    .from('profiles')
    .select('email, nama')
    .eq('id', pasienId)
    .maybeSingle()

  if (!profil) return gagal({ umum: 'Akun tidak ditemukan.' })

  const { data: tautan, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: profil.email,
    options: { redirectTo: `${alamatAplikasi()}/masuk` },
  })

  if (error || !tautan.properties?.action_link) {
    return gagal({ umum: 'Tautan reset password gagal dibuat. Coba lagi.' })
  }

  const alamat = tautan.properties.action_link
  const hasilEmail = await kirimEmail({
    ke: profil.email,
    subjek: 'Atur ulang password CatatanHD',
    html: `<p>Halo ${profil.nama},</p><p>Admin CatatanHD meminta atur ulang password akun Anda. Buka tautan berikut untuk membuat password baru.</p><p><a href="${alamat}">Atur ulang password</a></p><p>Jika Anda tidak meminta ini, abaikan email ini.</p>`,
  })

  await catatAudit(aktorId, 'reset_password', pasienId, { terkirim: hasilEmail.ok })
  return berhasil({ terkirim: hasilEmail.ok, tautan: alamat })
}

/**
 * Menghapus akun auth; profil, sesi, tensi, dan lab ikut terhapus lewat cascade.
 * `konfirmasi` wajib sama dengan username akun. Pemeriksaan dilakukan di sini,
 * bukan di browser, agar penghapusan tidak bisa terjadi hanya dengan menekan
 * tombol tanpa benar-benar mengetik username.
 */
export async function hapusPengguna(
  pasienId: string,
  aktorId: string,
  konfirmasi: string,
): Promise<Hasil> {
  const admin = buatKlienAdmin()
  const { data: profil } = await admin
    .from('profiles')
    .select('username, nama')
    .eq('id', pasienId)
    .maybeSingle()

  if (!profil) return gagal({ umum: 'Akun tidak ditemukan.' })

  if (konfirmasi.trim().toLowerCase() !== profil.username.toLowerCase()) {
    return gagal({ konfirmasi: 'Username yang diketik tidak cocok dengan akun ini.' })
  }

  await catatAudit(aktorId, 'hapus_akun', pasienId, {
    username: profil.username,
    nama: profil.nama,
  })

  const { error } = await admin.auth.admin.deleteUser(pasienId)
  if (error) return gagal({ umum: 'Akun gagal dihapus. Coba lagi.' })

  return berhasil(undefined)
}

/** Riwayat aksi admin terbaru untuk halaman detail pengguna. */
export async function ambilAudit(targetId: string) {
  const admin = buatKlienAdmin()
  const { data } = await admin
    .from('audit_logs')
    .select('*')
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    .limit(10)

  return data ?? []
}
