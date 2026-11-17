import { describe, expect, it } from 'vitest'
import { skemaLab, skemaLabPasangan } from '../../src/schema/lab'

function galatDi(
  hasil: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } },
  jalur: string,
) {
  if (hasil.success) return false
  return hasil.error?.issues.some((masalah) => masalah.path.join('.') === jalur) ?? false
}

describe('validasi hasil laboratorium', () => {
  it('menerima HB dengan nilai dan tanggal yang wajar', () => {
    const hasil = skemaLab.safeParse({
      jenis: 'hb',
      tanggal: '2026-11-02',
      nilai: '10.4',
      catatan: '',
    })
    expect(hasil.success).toBe(true)
    if (hasil.success) {
      expect(hasil.data.nilai).toBe(10.4)
      expect(hasil.data.catatan).toBeNull()
    }
  })

  it('menolak jenis pemeriksaan yang tidak dikenal', () => {
    const hasil = skemaLab.safeParse({
      jenis: 'gula_darah',
      tanggal: '2026-11-02',
      nilai: '90',
    })
    expect(galatDi(hasil, 'jenis')).toBe(true)
  })

  it('menolak nilai nol atau negatif', () => {
    expect(skemaLab.safeParse({ jenis: 'ureum', tanggal: '2026-11-02', nilai: '0' }).success).toBe(
      false,
    )
    expect(
      skemaLab.safeParse({ jenis: 'kreatinin', tanggal: '2026-11-02', nilai: '-1' }).success,
    ).toBe(false)
  })

  it('menolak tanggal pemeriksaan di masa depan', () => {
    const hasil = skemaLab.safeParse({
      jenis: 'hb',
      tanggal: '2999-01-01',
      nilai: '11',
    })
    expect(galatDi(hasil, 'tanggal')).toBe(true)
  })

  it('menolak tanggal yang tidak ada di kalender', () => {
    const hasil = skemaLab.safeParse({
      jenis: 'hb',
      tanggal: '2026-02-30',
      nilai: '11',
    })
    expect(galatDi(hasil, 'tanggal')).toBe(true)
  })
})

describe('validasi ureum dan kreatinin berpasangan', () => {
  it('menerima satu sampel dengan dua nilai', () => {
    const hasil = skemaLabPasangan.safeParse({
      tanggal: '2026-03-14',
      ureum: '120',
      kreatinin: '8.5',
      catatan: 'Sampel pagi',
    })
    expect(hasil.success).toBe(true)
    if (hasil.success) expect(hasil.data.kreatinin).toBe(8.5)
  })

  it('menolak bila salah satu nilai kosong', () => {
    const hasil = skemaLabPasangan.safeParse({
      tanggal: '2026-03-14',
      ureum: '120',
      kreatinin: '',
    })
    expect(galatDi(hasil, 'kreatinin')).toBe(true)
  })

  it('membatasi catatan agar tidak membanjiri halaman', () => {
    const hasil = skemaLabPasangan.safeParse({
      tanggal: '2026-03-14',
      ureum: '120',
      kreatinin: '8.5',
      catatan: 'x'.repeat(201),
    })
    expect(galatDi(hasil, 'catatan')).toBe(true)
  })
})
