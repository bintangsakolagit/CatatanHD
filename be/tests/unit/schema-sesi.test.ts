import { describe, expect, it } from 'vitest'
import { skemaSesi } from '../../src/schema/sesi'

/** Muatan dasar yang valid; setiap uji hanya mengubah satu bagian. */
function sesiDasar() {
  return {
    tanggal: '2026-01-10',
    durasi_menit: '300',
    keluhan: '',
    bb_kemarin_kg: '62.4',
    bb_pra_kg: '63.2',
    bb_pasca_kg: '60.8',
    tensi_pra_sistolik: '150',
    tensi_pra_diastolik: '90',
    tensi_pasca_sistolik: '130',
    tensi_pasca_diastolik: '80',
    catatan: '',
    tensi: [],
  }
}

function punyaGalatDi(
  hasil: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } },
  jalur: string,
) {
  if (hasil.success) return false
  return hasil.error?.issues.some((masalah) => masalah.path.join('.') === jalur) ?? false
}

describe('validasi sesi cuci darah', () => {
  it('menerima isian lengkap yang wajar', () => {
    const hasil = skemaSesi.safeParse(sesiDasar())
    expect(hasil.success).toBe(true)
    if (hasil.success) {
      expect(hasil.data.durasi_menit).toBe(300)
      expect(hasil.data.bb_pasca_kg).toBe(60.8)
      expect(hasil.data.keluhan).toBeNull()
      expect(hasil.data.tensi).toEqual([])
    }
  })

  it('mengubah teks kosong menjadi null agar database bersih', () => {
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), catatan: '   ' })
    expect(hasil.success).toBe(true)
    if (hasil.success) expect(hasil.data.catatan).toBeNull()
  })

  it('menolak durasi di luar pilihan', () => {
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), durasi_menit: '250' })
    expect(punyaGalatDi(hasil, 'durasi_menit')).toBe(true)
  })

  it('menolak tanggal di masa depan', () => {
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), tanggal: '2999-01-01' })
    expect(punyaGalatDi(hasil, 'tanggal')).toBe(true)
  })

  it('menolak sistolik yang tidak lebih tinggi dari diastolik', () => {
    const hasil = skemaSesi.safeParse({
      ...sesiDasar(),
      tensi_pra_sistolik: '90',
      tensi_pra_diastolik: '90',
    })
    expect(punyaGalatDi(hasil, 'tensi_pra_sistolik')).toBe(true)
  })

  it('mewajibkan tensi akhir sesi diisi berpasangan', () => {
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), tensi_pasca_diastolik: '' })
    expect(punyaGalatDi(hasil, 'tensi_pasca_sistolik')).toBe(true)
  })

  it('menerima tensi akhir sesi yang dikosongkan seluruhnya', () => {
    const hasil = skemaSesi.safeParse({
      ...sesiDasar(),
      tensi_pasca_sistolik: '',
      tensi_pasca_diastolik: '',
    })
    expect(hasil.success).toBe(true)
    if (hasil.success) {
      expect(hasil.data.tensi_pasca_sistolik).toBeNull()
      expect(hasil.data.tensi_pasca_diastolik).toBeNull()
    }
  })

  it('memeriksa setiap baris tensi berkala', () => {
    const hasil = skemaSesi.safeParse({
      ...sesiDasar(),
      tensi: [{ jam: '09:30', sistolik: '120', diastolik: '130', nadi: '' }],
    })
    expect(punyaGalatDi(hasil, 'tensi.0.sistolik')).toBe(true)
  })

  it('menolak jam tensi berkala yang tidak berformat HH:MM', () => {
    const hasil = skemaSesi.safeParse({
      ...sesiDasar(),
      tensi: [{ jam: '9.30', sistolik: '120', diastolik: '80', nadi: '78' }],
    })
    expect(punyaGalatDi(hasil, 'tensi.0.jam')).toBe(true)
  })

  it('membatasi jumlah pemeriksaan tensi per sesi', () => {
    const banyak = Array.from({ length: 25 }, () => ({
      jam: '10:00',
      sistolik: '120',
      diastolik: '80',
      nadi: '',
    }))
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), tensi: banyak })
    expect(punyaGalatDi(hasil, 'tensi')).toBe(true)
  })

  it('menolak berat badan di luar rentang medis yang masuk akal', () => {
    const hasil = skemaSesi.safeParse({ ...sesiDasar(), bb_pra_kg: '5' })
    expect(punyaGalatDi(hasil, 'bb_pra_kg')).toBe(true)
  })
})
