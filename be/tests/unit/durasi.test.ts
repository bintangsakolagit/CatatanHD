import { describe, expect, it } from 'vitest'
import { DAFTAR_DURASI, durasiValid, formatDurasi } from '../../src/util/durasi'

describe('durasi cuci darah', () => {
  it('menerima semua pilihan durasi unit hemodialisa', () => {
    for (const menit of DAFTAR_DURASI) {
      expect(durasiValid(menit)).toBe(true)
    }
  })

  it('menolak durasi di luar pilihan', () => {
    expect(durasiValid(200)).toBe(false)
    expect(durasiValid(0)).toBe(false)
    expect(durasiValid(301)).toBe(false)
  })

  it('menampilkan jam bulat tanpa menit', () => {
    expect(formatDurasi(300)).toBe('5 jam')
    expect(formatDurasi(240)).toBe('4 jam')
    expect(formatDurasi(180)).toBe('3 jam')
  })

  it('menampilkan setengah jam dengan benar', () => {
    expect(formatDurasi(270)).toBe('4 jam 30 menit')
    expect(formatDurasi(210)).toBe('3 jam 30 menit')
  })

  it('tetap masuk akal untuk nilai di bawah satu jam', () => {
    expect(formatDurasi(45)).toBe('45 menit')
    expect(formatDurasi(0)).toBe('0 menit')
  })
})
