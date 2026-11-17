'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { aksiHapusPengguna, aksiResetPassword, aksiUbahStatus } from '@/actions/admin'
import { STATUS_AWAL, type StatusForm } from '@/actions/tipe'
import { Input, Kolom } from '@/components/ui/kolom'
import { Peringatan } from '@/components/ui/peringatan'
import { Tombol } from '@/components/ui/tombol'
import { Kartu, JudulBagian } from '@/components/ui/kartu'

/**
 * Tiga aksi admin untuk satu akun pasien.
 * Setiap aksi punya status sendiri agar pesan berhasil atau galat tidak
 * tertukar dengan aksi lain di halaman yang sama.
 */
export function AksiPengguna({
  id,
  username,
  aktif,
}: {
  id: string
  username: string
  aktif: boolean
}) {
  return (
    <div className="space-y-4">
      <AksiStatus id={id} aktif={aktif} />
      <AksiResetPassword id={id} />
      <AksiHapus id={id} username={username} />
    </div>
  )
}

function AksiStatus({ id, aktif }: { id: string; aktif: boolean }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(aksiUbahStatus, STATUS_AWAL)

  return (
    <Kartu className="space-y-4 p-5">
      <JudulBagian
        label="Akses"
        judul={aktif ? 'Nonaktifkan akun' : 'Aktifkan akun'}
        keterangan={
          aktif
            ? 'Akun yang dinonaktifkan tidak bisa masuk, tetapi catatannya tetap tersimpan.'
            : 'Akun yang aktif kembali bisa masuk dan membuka catatannya.'
        }
      />

      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <form action={aksi}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="aktif" value={aktif ? '0' : '1'} />
        <Tombol type="submit" varian="sekunder" disabled={sedang}>
          {sedang ? 'Menyimpan…' : aktif ? 'Nonaktifkan akun' : 'Aktifkan akun'}
        </Tombol>
      </form>
    </Kartu>
  )
}

function AksiResetPassword({ id }: { id: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(
    aksiResetPassword,
    STATUS_AWAL,
  )
  const [tersalin, setTersalin] = useState(false)

  async function salinTautan() {
    if (!status.tautan) return
    try {
      await navigator.clipboard.writeText(status.tautan)
      setTersalin(true)
    } catch {
      // Clipboard bisa diblokir browser. Tautan tetap terlihat untuk disalin manual.
      setTersalin(false)
    }
  }

  return (
    <Kartu className="space-y-4 p-5">
      <JudulBagian
        label="Bantuan masuk"
        judul="Reset password"
        keterangan="Tautan resmi dikirim ke email pasien. Tautan juga ditampilkan agar bisa diteruskan lewat WhatsApp."
      />

      {status.pesan ? (
        <Peringatan jenis={status.sukses ? 'sukses' : 'galat'}>{status.pesan}</Peringatan>
      ) : null}
      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <form action={aksi}>
        <input type="hidden" name="id" value={id} />
        <Tombol type="submit" varian="sekunder" disabled={sedang}>
          {sedang ? 'Menyiapkan tautan…' : 'Kirim tautan reset password'}
        </Tombol>
      </form>

      {status.tautan ? (
        <div className="space-y-2 rounded-kontrol border border-border/40 p-3">
          <label htmlFor="tautan-reset" className="block text-xs font-semibold">
            Tautan reset password
          </label>
          <Input
            id="tautan-reset"
            readOnly
            value={status.tautan}
            onFocus={(event) => event.currentTarget.select()}
            className="text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Tombol type="button" varian="halus" ukuran="sm" onClick={salinTautan}>
              {tersalin ? 'Tersalin' : 'Salin tautan'}
            </Tombol>
            <span className="text-xs text-muted">
              Tautan berlaku sekali pakai dan punya masa berlaku terbatas.
            </span>
          </div>
        </div>
      ) : null}
    </Kartu>
  )
}

function AksiHapus({ id, username }: { id: string; username: string }) {
  const [status, aksi, sedang] = useActionState<StatusForm, FormData>(
    aksiHapusPengguna,
    STATUS_AWAL,
  )
  const [konfirmasi, setKonfirmasi] = useState('')
  const cocok = konfirmasi.trim().toLowerCase() === username.toLowerCase()

  return (
    <Kartu className="space-y-4 p-5">
      <JudulBagian
        label="Tindakan permanen"
        judul="Hapus akun"
        keterangan="Seluruh sesi cuci darah, tensi berkala, dan hasil laboratorium ikut terhapus dan tidak bisa dikembalikan."
      />

      {status.galat?.umum ? <Peringatan jenis="galat">{status.galat.umum}</Peringatan> : null}

      <form
        action={aksi}
        className="space-y-3"
        onSubmit={(event) => {
          if (!cocok) {
            event.preventDefault()
            return
          }
          const lanjut = window.confirm(
            `Hapus akun @${username} beserta seluruh catatannya? Tindakan ini tidak bisa dibatalkan.`,
          )
          if (!lanjut) event.preventDefault()
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Kolom
          label="Ketik username untuk mengonfirmasi"
          htmlFor="konfirmasi-hapus"
          petunjuk={`Username akun ini: @${username}`}
          galat={status.galat?.konfirmasi}
        >
          <Input
            id="konfirmasi-hapus"
            name="konfirmasi"
            autoComplete="off"
            placeholder={username}
            value={konfirmasi}
            onChange={(event) => setKonfirmasi(event.target.value)}
          />
        </Kolom>
        <Tombol type="submit" varian="bahaya" disabled={sedang || !cocok}>
          {sedang ? 'Menghapus…' : 'Hapus akun permanen'}
        </Tombol>
      </form>
    </Kartu>
  )
}
