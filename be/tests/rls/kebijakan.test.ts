import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Uji kebijakan Row Level Security terhadap Supabase lokal.
 *
 * Berkas ini dilewati bila variabel lingkungan tidak tersedia, sehingga
 * `npm run test` tetap bisa dijalankan tanpa Docker. Untuk menjalankannya:
 *
 *   supabase start
 *   npm run test:rls
 *
 * Skrip tersebut memuat fe/.env.local. Bila ingin memakai project uji lain,
 * isi SUPABASE_TEST_URL, SUPABASE_TEST_ANON_KEY, dan
 * SUPABASE_TEST_SERVICE_ROLE_KEY.
 */

const url = process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const kunciAnon = process.env.SUPABASE_TEST_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const kunciService =
  process.env.SUPABASE_TEST_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

const siap = Boolean(url && kunciAnon && kunciService)

const opsiAuth = {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
} as const

interface AkunUji {
  id: string
  email: string
  password: string
  username: string
}

describe.skipIf(!siap)('kebijakan RLS', () => {
  const akhiran = randomUUID().slice(0, 8)
  const dibuat: string[] = []
  let admin: SupabaseClient
  let akunA: AkunUji
  let akunB: AkunUji
  let sesiBId: string
  let sesiAId: string
  let klienA: SupabaseClient

  async function buatAkun(label: string): Promise<AkunUji> {
    const email = `uji-${label}-${akhiran}@contoh.id`
    const username = `uji.${label}.${akhiran}`
    const password = `rahasia-${akhiran}-${label}`

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error || !data.user) {
      throw new Error(`Gagal membuat akun uji ${label}: ${error?.message ?? 'tanpa keterangan'}`)
    }
    dibuat.push(data.user.id)

    const { error: galatProfil } = await admin.from('profiles').insert({
      id: data.user.id,
      email,
      role: 'pasien',
      username,
      nama: `Pasien ${label.toUpperCase()}`,
      tanggal_lahir: '1980-01-15',
      alamat: 'Jl. Uji No. 1, Jakarta',
      bb_kering_kg: 60,
    })
    if (galatProfil) throw new Error(`Gagal membuat profil uji: ${galatProfil.message}`)

    return { id: data.user.id, email, password, username }
  }

  beforeAll(async () => {
    admin = createClient(url ?? '', kunciService ?? '', opsiAuth)
    akunA = await buatAkun('a')
    akunB = await buatAkun('b')

    const { data: sesiA, error: galatA } = await admin
      .from('dialysis_sessions')
      .insert({
        patient_id: akunA.id,
        tanggal: '2026-01-05',
        durasi_menit: 300,
        bb_pra_kg: 63,
        tensi_pra_sistolik: 150,
        tensi_pra_diastolik: 90,
      })
      .select('id')
      .single()
    if (galatA || !sesiA) throw new Error(`Gagal membuat sesi A: ${galatA?.message}`)
    sesiAId = sesiA.id

    const { data: sesiB, error: galatB } = await admin
      .from('dialysis_sessions')
      .insert({
        patient_id: akunB.id,
        tanggal: '2026-01-06',
        durasi_menit: 240,
        bb_pra_kg: 58,
        tensi_pra_sistolik: 140,
        tensi_pra_diastolik: 85,
      })
      .select('id')
      .single()
    if (galatB || !sesiB) throw new Error(`Gagal membuat sesi B: ${galatB?.message}`)
    sesiBId = sesiB.id

    klienA = createClient(url ?? '', kunciAnon ?? '', opsiAuth)
    const { error: galatMasuk } = await klienA.auth.signInWithPassword({
      email: akunA.email,
      password: akunA.password,
    })
    if (galatMasuk) throw new Error(`Gagal masuk sebagai pasien A: ${galatMasuk.message}`)
  })

  afterAll(async () => {
    if (klienA) await klienA.auth.signOut()
    if (!admin) return
    for (const id of dibuat) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  it('pasien hanya membaca sesi miliknya', async () => {
    const { data: milikSendiri } = await klienA
      .from('dialysis_sessions')
      .select('id')
      .eq('id', sesiAId)

    expect(milikSendiri).toHaveLength(1)

    const { data: milikOrangLain } = await klienA
      .from('dialysis_sessions')
      .select('id')
      .eq('id', sesiBId)

    expect(milikOrangLain).toHaveLength(0)
  })

  it('pasien tidak dapat mengubah profil pasien lain', async () => {
    const { data: hasil } = await klienA
      .from('profiles')
      .update({ nama: 'Diubah tanpa izin' })
      .eq('id', akunB.id)
      .select('id')

    expect(hasil ?? []).toHaveLength(0)

    const { data: profilB } = await admin
      .from('profiles')
      .select('nama')
      .eq('id', akunB.id)
      .single()

    expect(profilB?.nama).toBe('Pasien B')
  })

  it('pasien tidak dapat menaikkan role sendiri menjadi super admin', async () => {
    const { error } = await klienA
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', akunA.id)

    expect(error).not.toBeNull()

    const { data: profilA } = await admin
      .from('profiles')
      .select('role')
      .eq('id', akunA.id)
      .single()

    expect(profilA?.role).toBe('pasien')
  })

  it('pengunjung tanpa sesi tidak membaca data apa pun', async () => {
    const tamu = createClient(url ?? '', kunciAnon ?? '', opsiAuth)

    const { data: profil } = await tamu.from('profiles').select('id')
    const { data: sesi } = await tamu.from('dialysis_sessions').select('id')

    expect(profil ?? []).toHaveLength(0)
    expect(sesi ?? []).toHaveLength(0)
  })

  it('fungsi retensi hanya boleh dipanggil service role', async () => {
    const { error } = await klienA.rpc('cari_akun_pasif', { batas: 5 })
    expect(error).not.toBeNull()

    const { error: galatAdmin } = await admin.rpc('cari_akun_pasif', { batas: 5 })
    expect(galatAdmin).toBeNull()
  })

  it('ringkasan histori hanya menghitung catatan milik sendiri', async () => {
    const { data, error } = await klienA.rpc('ringkasan_histori', {
      p_dari: '2025-12-01',
      p_sampai: '2026-02-01',
    })

    expect(error).toBeNull()
    expect(data?.[0]?.total_sesi).toBe(1)
  })
})
