import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { wajibAdmin } from '@catatanhd/be/auth/guard'
import { ambilAudit, detailPengguna } from '@catatanhd/be/services/pengguna'
import { hitungUmur } from '@catatanhd/be/util/tanggal'
import { AksiPengguna } from '@/components/admin/aksi-pengguna'
import { Kartu, JudulBagian, Statistik } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { formatAngka, formatBerat, formatNilaiLab, formatTanggal, formatWaktu } from '@/lib/format'

export const metadata: Metadata = { title: 'Detail pengguna' }

const LABEL_JENIS: Record<'hb' | 'ureum' | 'kreatinin', string> = {
  hb: 'HB',
  ureum: 'Ureum',
  kreatinin: 'Kreatinin',
}

const SATUAN_JENIS: Record<'hb' | 'ureum' | 'kreatinin', string> = {
  hb: 'g/dL',
  ureum: 'mg/dL',
  kreatinin: 'mg/dL',
}

const LABEL_AUDIT: Record<string, string> = {
  aktifkan_akun: 'Akun diaktifkan',
  nonaktifkan_akun: 'Akun dinonaktifkan',
  reset_password: 'Tautan reset password dibuat',
  hapus_akun: 'Akun dihapus',
  retensi_hapus: 'Dihapus otomatis karena tidak aktif',
}

export default async function HalamanDetailPengguna({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await wajibAdmin()

  const { id } = await params
  const data = await detailPengguna(id)
  if (!data) notFound()

  const audit = await ambilAudit(id)
  const { profil } = data
  const turun =
    data.sesiTerakhir && data.sesiTerakhir.bb_pasca_kg !== null
      ? Math.round((data.sesiTerakhir.bb_pra_kg - data.sesiTerakhir.bb_pasca_kg) * 10) / 10
      : null

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Link
          href="/pengguna"
          className="text-sm font-semibold text-muted underline underline-offset-4"
        >
          Kembali ke daftar pengguna
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Panel admin
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">{profil.nama}</h1>
            <p className="text-sm text-muted">
              @{profil.username} · {profil.email}
            </p>
          </div>
          <Lencana nada={profil.is_active ? 'ok' : 'bahaya'}>
            {profil.is_active ? 'Aktif' : 'Nonaktif'}
          </Lencana>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Statistik label="Total sesi" nilai={data.jumlahSesi} satuan="sesi" />
        <Statistik
          label="Sesi terakhir"
          nilai={data.sesiTerakhir ? formatTanggal(data.sesiTerakhir.tanggal) : '—'}
          keterangan={
            turun === null
              ? 'Belum ada catatan'
              : `Turun ${formatAngka(turun, 1)} kg saat sesi terakhir`
          }
        />
        <Statistik
          label="Berat kering"
          nilai={formatAngka(profil.bb_kering_kg, 1)}
          satuan="kg"
          keterangan="Data profil"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="p-5">
          <JudulBagian label="Identitas" judul="Data pasien" />
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Umur</dt>
              <dd className="mt-0.5 font-semibold">{hitungUmur(profil.tanggal_lahir)} tahun</dd>
            </div>
            <div>
              <dt className="text-muted">Tanggal lahir</dt>
              <dd className="mt-0.5 font-semibold">{formatTanggal(profil.tanggal_lahir)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Alamat</dt>
              <dd className="mt-0.5 font-semibold">{profil.alamat}</dd>
            </div>
            <div>
              <dt className="text-muted">Masuk terakhir</dt>
              <dd className="mt-0.5 font-semibold">
                {profil.last_login_at ? formatWaktu(profil.last_login_at) : 'Belum pernah masuk'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Terdaftar sejak</dt>
              <dd className="mt-0.5 font-semibold">
                {formatTanggal(profil.created_at.slice(0, 10))}
              </dd>
            </div>
          </dl>
        </Kartu>

        <Kartu className="p-5">
          <JudulBagian
            label="Laboratorium"
            judul="Pemeriksaan terbaru"
            keterangan={
              data.labTerbaru.length === 0 ? 'Belum ada pemeriksaan yang dicatat.' : undefined
            }
          />
          {data.labTerbaru.length > 0 ? (
            <ul className="mt-4 divide-y divide-border/20 text-sm">
              {data.labTerbaru.map((baris) => (
                <li key={baris.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-semibold">{LABEL_JENIS[baris.jenis]}</p>
                    <p className="text-xs text-muted">{formatTanggal(baris.tanggal)}</p>
                  </div>
                  <p className="angka font-bold">
                    {formatNilaiLab(baris.nilai)}{' '}
                    <span className="text-xs font-normal text-muted">
                      {SATUAN_JENIS[baris.jenis]}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {data.sesiTerakhir ? (
            <div className="mt-4 border-t border-border/20 pt-3 text-sm">
              <p className="text-muted">Sesi terakhir</p>
              <p className="mt-0.5 font-semibold">
                {formatTanggal(data.sesiTerakhir.tanggal)} ·{' '}
                {formatBerat(data.sesiTerakhir.bb_pra_kg)}
                {data.sesiTerakhir.bb_pasca_kg !== null
                  ? ` → ${formatBerat(data.sesiTerakhir.bb_pasca_kg)}`
                  : ' (berat sesudah belum diisi)'}
              </p>
            </div>
          ) : null}
        </Kartu>
      </div>

      <AksiPengguna id={profil.id} username={profil.username} aktif={profil.is_active} />

      <Kartu className="p-5">
        <JudulBagian
          label="Jejak admin"
          judul="Riwayat tindakan"
          keterangan={audit.length === 0 ? 'Belum ada tindakan admin pada akun ini.' : undefined}
        />
        {audit.length > 0 ? (
          <ul className="mt-4 divide-y divide-border/20 text-sm">
            {audit.map((baris) => (
              <li
                key={baris.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
              >
                <span className="font-semibold">{LABEL_AUDIT[baris.aksi] ?? baris.aksi}</span>
                <span className="text-xs text-muted">{formatWaktu(baris.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Kartu>
    </div>
  )
}
