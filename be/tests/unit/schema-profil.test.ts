import { describe, expect, it } from 'vitest'
import { skemaDaftar, skemaUbahPassword, skemaUbahProfil } from '../../src/schema/profil'
import { tanggalJakarta } from '../../src/util/tanggal'

function pendaftaranDasar() {
  return {
    nama: 'Siti Aminah',
    email: 'siti@contoh.id',
    username: 'siti.aminah',
    password: 'rahasia123',
    konfirmasi_password: 'rahasia123',
    tanggal_lahir: '1975-04-12',
    alamat: 'Jl. Melati No. 10, Bandung',
    bb_kering_kg: '58.5',
  }
}

describe('validasi pendaftaran', () => {
  it('menerima data pendaftaran yang lengkap', () => {
    const hasil = skemaDaftar.safeParse(pendaftaranDasar())
    expect(hasil.success).toBe(true)
    if (hasil.success) expect(hasil.data.bb_kering_kg).toBe(58.5)
  })

  it('menolak konfirmasi password yang berbeda', () => {
    const hasil = skemaDaftar.safeParse({
      ...pendaftaranDasar(),
      konfirmasi_password: 'rahasia456',
    })
    expect(hasil.success).toBe(false)
  })

  it('menolak username dengan huruf besar atau spasi', () => {
    expect(skemaDaftar.safeParse({ ...pendaftaranDasar(), username: 'Siti Aminah' }).success).toBe(
      false,
    )
    expect(skemaDaftar.safeParse({ ...pendaftaranDasar(), username: 'siti aminah' }).success).toBe(
      false,
    )
  })

  it('menolak password tanpa angka atau terlalu pendek', () => {
    expect(
      skemaDaftar.safeParse({
        ...pendaftaranDasar(),
        password: 'hanyahuruf',
        konfirmasi_password: 'hanyahuruf',
      }).success,
    ).toBe(false)
    expect(
      skemaDaftar.safeParse({
        ...pendaftaranDasar(),
        password: 'a1',
        konfirmasi_password: 'a1',
      }).success,
    ).toBe(false)
  })

  it('menolak umur nol dan tanggal lahir di masa depan', () => {
    expect(
      skemaDaftar.safeParse({ ...pendaftaranDasar(), tanggal_lahir: tanggalJakarta() }).success,
    ).toBe(false)
    expect(
      skemaDaftar.safeParse({ ...pendaftaranDasar(), tanggal_lahir: '2999-01-01' }).success,
    ).toBe(false)
  })

  it('menolak berat badan kering di luar rentang', () => {
    expect(skemaDaftar.safeParse({ ...pendaftaranDasar(), bb_kering_kg: '10' }).success).toBe(false)
    expect(skemaDaftar.safeParse({ ...pendaftaranDasar(), bb_kering_kg: '400' }).success).toBe(
      false,
    )
  })
})

describe('validasi ubah profil', () => {
  it('menerima data dasar tanpa email dan password', () => {
    const hasil = skemaUbahProfil.safeParse({
      nama: 'Siti Aminah',
      username: 'siti.aminah',
      tanggal_lahir: '1975-04-12',
      alamat: 'Jl. Melati No. 10, Bandung',
      bb_kering_kg: '58.5',
    })
    expect(hasil.success).toBe(true)
  })

  it('menolak alamat yang terlalu pendek', () => {
    const hasil = skemaUbahProfil.safeParse({
      nama: 'Siti Aminah',
      username: 'siti.aminah',
      tanggal_lahir: '1975-04-12',
      alamat: 'Jl',
      bb_kering_kg: '58.5',
    })
    expect(hasil.success).toBe(false)
  })
})

describe('validasi ubah password', () => {
  it('menerima password baru yang memenuhi syarat', () => {
    expect(
      skemaUbahPassword.safeParse({
        password_baru: 'baru12345',
        konfirmasi_password: 'baru12345',
      }).success,
    ).toBe(true)
  })

  it('menolak bila konfirmasi tidak sama', () => {
    expect(
      skemaUbahPassword.safeParse({
        password_baru: 'baru12345',
        konfirmasi_password: 'baru54321',
      }).success,
    ).toBe(false)
  })
})
