import type { Metadata } from 'next'
import Link from 'next/link'
import { wajibAdmin } from '@catatanhd/be/auth/guard'
import { daftarPengguna } from '@catatanhd/be/services/pengguna'
import { hitungUmur } from '@catatanhd/be/util/tanggal'
import { Kartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Tombol, gayaTombol } from '@/components/ui/tombol'
import { formatTanggal, formatWaktu } from '@/lib/format'

export const metadata: Metadata = { title: 'Pengguna' }

export default async function HalamanDaftarPengguna({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string; halaman?: string }>
}) {
  await wajibAdmin()

  const parameter = await searchParams
  const cari = (parameter.cari ?? '').trim()
  const halaman = Math.max(1, Number.parseInt(parameter.halaman ?? '1', 10) || 1)
  const data = await daftarPengguna({ cari, halaman })

  const tautan = (nomor: number) => `/pengguna?cari=${encodeURIComponent(cari)}&halaman=${nomor}`

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Panel admin
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Pengguna</h1>
        <p className="text-sm text-muted">
          Kelola akun pasien, kirim tautan reset password, dan hapus akun yang sudah tidak dipakai.
        </p>
      </div>

      <Kartu className="space-y-4 p-5">
        <form method="get" action="/pengguna" className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="cari" className="block text-sm font-semibold">
              Cari pengguna
            </label>
            <input
              id="cari"
              name="cari"
              type="search"
              defaultValue={cari}
              placeholder="Nama, username, atau email"
              className="h-11 w-full rounded-kontrol border border-border bg-surface px-3.5 text-sm"
            />
          </div>
          <Tombol type="submit" ukuran="sm">
            Cari
          </Tombol>
          {cari ? (
            <Link href="/pengguna" className={gayaTombol('halus', 'sm')}>
              Bersihkan
            </Link>
          ) : null}
        </form>

        <p className="text-xs text-muted">
          {data.total === 0
            ? cari
              ? `Tidak ada akun yang cocok dengan “${cari}”.`
              : 'Belum ada akun pasien yang terdaftar.'
            : `${data.total} akun terdaftar. Menampilkan halaman ${data.halaman} dari ${data.totalHalaman}.`}
        </p>
      </Kartu>

      {data.daftar.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.daftar.map((profil) => (
            <li key={profil.id}>
              <Kartu className="flex h-full flex-col justify-between gap-4 p-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{profil.nama}</p>
                    <Lencana nada={profil.is_active ? 'ok' : 'bahaya'}>
                      {profil.is_active ? 'Aktif' : 'Nonaktif'}
                    </Lencana>
                  </div>
                  <p className="text-sm text-muted">
                    @{profil.username} · {hitungUmur(profil.tanggal_lahir)} tahun
                  </p>
                  <p className="break-all text-sm text-muted">{profil.email}</p>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/20 pt-3 text-xs text-muted">
                  <div className="space-y-0.5">
                    <p>Masuk terakhir</p>
                    <p className="font-semibold text-text">
                      {profil.last_login_at ? formatWaktu(profil.last_login_at) : 'Belum pernah'}
                    </p>
                    <p>Terdaftar {formatTanggal(profil.created_at.slice(0, 10))}</p>
                  </div>
                  <Link href={`/pengguna/${profil.id}`} className={gayaTombol('sekunder', 'sm')}>
                    Kelola
                  </Link>
                </div>
              </Kartu>
            </li>
          ))}
        </ul>
      ) : (
        <Kartu className="space-y-1 p-6 text-center">
          <p className="text-sm font-semibold">Daftar pengguna kosong.</p>
          <p className="text-sm text-muted">
            Akun muncul di sini setelah pasien menyelesaikan pendaftaran.
          </p>
        </Kartu>
      )}

      {data.totalHalaman > 1 ? (
        <div className="flex items-center justify-between pt-1 text-sm">
          {halaman > 1 ? (
            <Link href={tautan(halaman - 1)} className="font-semibold underline underline-offset-4">
              Sebelumnya
            </Link>
          ) : (
            <span className="text-muted">Awal</span>
          )}
          <span className="angka text-muted">
            Halaman {data.halaman} dari {data.totalHalaman}
          </span>
          {halaman < data.totalHalaman ? (
            <Link href={tautan(halaman + 1)} className="font-semibold underline underline-offset-4">
              Berikutnya
            </Link>
          ) : (
            <span className="text-muted">Akhir</span>
          )}
        </div>
      ) : null}
    </div>
  )
}
