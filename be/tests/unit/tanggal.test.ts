import { describe, expect, it } from 'vitest'
import {
  geserBulan,
  geserHari,
  hitungUmur,
  rentangTigaBulan,
  tanggalJakarta,
  tanggalMasaDepan,
  tanggalValid,
} from '../../src/util/tanggal'

describe('validasi tanggal', () => {
  it('menerima tanggal kalender yang benar', () => {
    expect(tanggalValid('2026-11-18')).toBe(true)
    expect(tanggalValid('2024-02-29')).toBe(true)
  })

  it('menolak tanggal yang tidak ada di kalender', () => {
    expect(tanggalValid('2026-02-30')).toBe(false)
    expect(tanggalValid('2025-02-29')).toBe(false)
    expect(tanggalValid('2026-13-01')).toBe(false)
    expect(tanggalValid('2026-00-10')).toBe(false)
  })

  it('menolak format selain YYYY-MM-DD', () => {
    expect(tanggalValid('18-11-2026')).toBe(false)
    expect(tanggalValid('2026-1-8')).toBe(false)
    expect(tanggalValid('2026-11-18T10:00')).toBe(false)
  })

  it('menandai tanggal setelah hari ini sebagai masa depan', () => {
    expect(tanggalMasaDepan('2026-11-19', '2026-11-18')).toBe(true)
    expect(tanggalMasaDepan('2026-11-18', '2026-11-18')).toBe(false)
    expect(tanggalMasaDepan('2026-11-17', '2026-11-18')).toBe(false)
  })

  it('mengembalikan tanggal hari ini dalam format ISO', () => {
    expect(tanggalJakarta(new Date('2026-11-18T03:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('pergeseran tanggal', () => {
  it('menggeser hari melewati batas bulan dan tahun', () => {
    expect(geserHari('2026-11-30', 1)).toBe('2026-12-01')
    expect(geserHari('2026-01-01', -1)).toBe('2025-12-31')
    expect(geserHari('2024-02-28', 1)).toBe('2024-02-29')
  })

  it('menggeser bulan dengan pengaman akhir bulan', () => {
    expect(geserBulan('2026-03-31', -1)).toBe('2026-02-28')
    expect(geserBulan('2024-03-31', -1)).toBe('2024-02-29')
    expect(geserBulan('2026-01-15', -1)).toBe('2025-12-15')
  })

  it('membentuk rentang tiga bulan untuk histori', () => {
    expect(rentangTigaBulan('2026-11-18')).toEqual({ dari: '2026-08-18', sampai: '2026-11-18' })
  })
})

describe('umur pasien', () => {
  it('dihitung dari tanggal lahir, bukan angka yang disimpan', () => {
    expect(hitungUmur('1990-05-10', '2026-05-09')).toBe(35)
    expect(hitungUmur('1990-05-10', '2026-05-10')).toBe(36)
    expect(hitungUmur('1990-05-10', '2026-11-18')).toBe(36)
  })

  it('mengembalikan nol untuk tanggal yang tidak lengkap', () => {
    expect(hitungUmur('', '2026-11-18')).toBe(0)
    expect(hitungUmur('1990', '2026-11-18')).toBe(0)
  })
})
