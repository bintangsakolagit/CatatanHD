import type { Metadata } from 'next'
import { aksiKeluar } from '@/actions/autentikasi'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { geserHari, hitungUmur, tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { FormPassword } from '@/components/profil/form-password'
import { FormProfil } from '@/components/profil/form-profil'
import { Kartu, JudulBagian } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/peringatan'
import { formatTanggal, formatWaktu } from '@/lib/format'

export const metadata: Metadata = { title: 'Profil' }

/** Menghitung sisa hari sebelum akun dihapus karena tidak aktif. */
function sisaHari(batas: string, hariIni: string): number {
  const selisih = Date.parse(`${batas}T00:00:00Z`) - Date.parse(`${hariIni}T00:00:00Z`)
  return Math.max(0, Math.ceil(selisih / 86_400_000))
}

export default async function HalamanProfil() {
  const sesi = await wajibLogin()
  const profil = sesi.profil
  const hariIni = tanggalJakarta()

  const terakhirMasuk = profil.last_login_at ?? profil.created_at
  // Tanggal aktivitas dihitung di zona aplikasi agar batas retensi tidak bergeser
  // satu hari karena timestamp disimpan dalam UTC.
  const batasHapus = geserHari(tanggalJakarta(new Date(terakhirMasuk)), 90)
  const sisa = sisaHari(batasHapus, hariIni)

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Akun</p>
        <h1 className="text-2xl font-extrabold tracking-tight">Profil dan pengaturan</h1>
      </div>

      <Kartu className="p-5">
        <JudulBagian
          label="Data akun"
          judul={profil.nama}
          aksi={
            <Lencana nada="ok">{profil.role === 'super_admin' ? 'Super admin' : 'Pasien'}</Lencana>
          }
        />
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 font-semibold">{profil.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Umur</dt>
            <dd className="mt-0.5 font-semibold">{hitungUmur(profil.tanggal_lahir)} tahun</dd>
          </div>
          <div>
            <dt className="text-muted">Masuk terakhir</dt>
            <dd className="mt-0.5 font-semibold">{formatWaktu(terakhirMasuk)}</dd>
          </div>
          <div>
            <dt className="text-muted">Terdaftar sejak</dt>
            <dd className="mt-0.5 font-semibold">
              {formatTanggal(profil.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
      </Kartu>

      {profil.role === 'pasien' ? (
        <Peringatan jenis={sisa <= 30 ? 'galat' : 'info'} judul="Retensi data">
          Akun yang tidak dipakai masuk selama 3 bulan akan dihapus beserta seluruh catatan.
          Berdasarkan aktivitas terakhir, batasnya {formatTanggal(batasHapus)}
          {sisa > 0 ? ` (${sisa} hari lagi)` : ''}. Cukup masuk sekali untuk memperpanjang.
        </Peringatan>
      ) : null}

      <Kartu className="p-5">
        <JudulBagian label="Data pasien" judul="Ubah profil" />
        <div className="mt-4">
          <FormProfil
            profil={{
              nama: profil.nama,
              username: profil.username,
              tanggal_lahir: profil.tanggal_lahir,
              alamat: profil.alamat,
              bb_kering_kg: profil.bb_kering_kg,
            }}
          />
        </div>
      </Kartu>

      <Kartu className="p-5">
        <JudulBagian label="Keamanan" judul="Ganti password" />
        <div className="mt-4">
          <FormPassword />
        </div>
      </Kartu>

      <Kartu className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold">Keluar dari akun</p>
          <p className="text-sm text-muted">Anda perlu masuk kembali untuk membuka catatan.</p>
        </div>
        <form action={aksiKeluar}>
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-kontrol border border-border px-4 text-sm font-semibold"
          >
            Keluar
          </button>
        </form>
      </Kartu>
    </div>
  )
}
