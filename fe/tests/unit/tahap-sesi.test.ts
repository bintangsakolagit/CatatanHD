import { describe, expect, it } from 'vitest'
import { periksaTahap, tahapUntukGalat, type NilaiSesi } from '../../src/lib/tahap-sesi'

/** Isian dasar yang valid; setiap uji hanya mengubah satu bagian. */
function nilaiDasar(): NilaiSesi {
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

const HARI_INI = '2026-01-10'

describe('validasi tahap formulir sesi', () => {
  it('menerima isian tahap 1 yang lengkap', () => {
    expect(periksaTahap(1, nilaiDasar(), HARI_INI)).toEqual({})
  })

  it('menolak tanggal kosong dan tanggal di masa depan', () => {
    expect(periksaTahap(1, { ...nilaiDasar(), tanggal: '' }, HARI_INI).tanggal).toBeDefined()
    expect(periksaTahap(1, { ...nilaiDasar(), tanggal: '2026-02-01' }, HARI_INI).tanggal).toContain(
      'masa depan',
    )
  })

  it('menolak durasi di luar pilihan unit', () => {
    expect(
      periksaTahap(1, { ...nilaiDasar(), durasi_menit: '250' }, HARI_INI).durasi_menit,
    ).toBeDefined()
  })

  it('mewajibkan berat dan tensi sebelum cuci darah', () => {
    const galat = periksaTahap(
      1,
      { ...nilaiDasar(), bb_pra_kg: '', tensi_pra_sistolik: '', tensi_pra_diastolik: '' },
      HARI_INI,
    )
    expect(galat.bb_pra_kg).toBeDefined()
    expect(galat.tensi_pra_sistolik).toBeDefined()
    expect(galat.tensi_pra_diastolik).toBeDefined()
  })

  it('menolak sistolik yang tidak lebih tinggi dari diastolik', () => {
    const galat = periksaTahap(
      1,
      { ...nilaiDasar(), tensi_pra_sistolik: '90', tensi_pra_diastolik: '90' },
      HARI_INI,
    )
    expect(galat.tensi_pra_sistolik).toContain('lebih besar')
  })

  it('mengabaikan baris tensi berkala yang belum diisi', () => {
    const galat = periksaTahap(
      2,
      {
        ...nilaiDasar(),
        tensi: [{ jam: '', sistolik: '', diastolik: '', nadi: '' }],
      },
      HARI_INI,
    )
    expect(galat).toEqual({})
  })

  it('menolak baris tensi berkala yang terisi sebagian', () => {
    const galat = periksaTahap(
      2,
      {
        ...nilaiDasar(),
        tensi: [{ jam: '09:30', sistolik: '140', diastolik: '', nadi: '' }],
      },
      HARI_INI,
    )
    expect(galat.tensi).toContain('Pemeriksaan 1')
  })

  it('menolak nadi berkala di luar rentang wajar', () => {
    const galat = periksaTahap(
      2,
      {
        ...nilaiDasar(),
        tensi: [{ jam: '09:30', sistolik: '140', diastolik: '80', nadi: '300' }],
      },
      HARI_INI,
    )
    expect(galat.tensi).toContain('nadi')
  })

  it('menerima tahap 3 yang dikosongkan seluruhnya', () => {
    const galat = periksaTahap(
      3,
      {
        ...nilaiDasar(),
        bb_pasca_kg: '',
        tensi_pasca_sistolik: '',
        tensi_pasca_diastolik: '',
      },
      HARI_INI,
    )
    expect(galat).toEqual({})
  })

  it('mewajibkan tensi akhir sesi diisi berpasangan', () => {
    const galat = periksaTahap(
      3,
      { ...nilaiDasar(), tensi_pasca_sistolik: '130', tensi_pasca_diastolik: '' },
      HARI_INI,
    )
    expect(galat.tensi_pasca_sistolik).toContain('lengkap')
  })
})

describe('pemetaan galat server ke tahap', () => {
  it('mengembalikan null bila tidak ada galat', () => {
    expect(tahapUntukGalat(undefined)).toBeNull()
    expect(tahapUntukGalat({})).toBeNull()
    expect(tahapUntukGalat({ umum: 'Sesi berakhir.' })).toBeNull()
  })

  it('memetakan kolom utama ke tahap yang tepat', () => {
    expect(tahapUntukGalat({ tanggal: 'x' })).toBe(1)
    expect(tahapUntukGalat({ tensi: 'x' })).toBe(2)
    expect(tahapUntukGalat({ tensi_pasca_diastolik: 'x' })).toBe(3)
  })

  it('memetakan galat baris tensi berkala ke tahap 2', () => {
    expect(tahapUntukGalat({ 'tensi.0.sistolik': 'x' })).toBe(2)
    expect(tahapUntukGalat({ 'tensi.12.nadi': 'x' })).toBe(2)
  })
})
