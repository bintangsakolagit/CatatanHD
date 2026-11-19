import type { Metadata } from 'next'
import { aksiKeluar } from '@/actions/autentikasi'
import { wajibLogin } from '@catatanhd/be/auth/sesi'
import { geserHari, hitungUmur, tanggalJakarta } from '@catatanhd/be/util/tanggal'
import { FormPassword } from '@/components/profil/form-password'
import { FormProfil } from '@/components/profil/form-profil'
import { Kartu, JudulBagian } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/peringatan'
import { Ikon } from '@/components/ui/ikon'
import { gayaTombol } from '@/components/ui/tombol'
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
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <Ikon nama="profil" className="h-3.5 w-3.5" tebal={2.2} />
          Akun
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Profil dan pengaturan</h1>
      </div>

      <Kartu className="p-5">
        <div className="flex items-center gap-3">
          <span className="gradien-tetes flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-lembut">
            {profil.nama.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{profil.nama}</p>
            <p className="text-sm text-muted">{profil.email}</p>
          </div>
          <div className="ml-auto">
            <Lencana nada={profil.role === 'super_admin' ? 'lila' : 'utama'}>
              {profil.role === 'super_admin' ? 'Super admin' : 'Pasien'}
            </Lencana>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-border/40 pt-4 text-sm sm:grid-cols-2">
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
          <div>
            <dt className="text-muted">Berat badan kering</dt>
            <dd className="angka mt-0.5 font-semibold">{profil.bb_kering_kg} kg</dd>
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
        <JudulBagian label="Data pasien" judul="Ubah profil" ikon="profil" />
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
        <JudulBagian label="Keamanan" judul="Ganti password" ikon="kunci" />
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
          <button type="submit" className={gayaTombol('sekunder', 'sm')}>
            <Ikon nama="keluar" className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </Kartu>
    </div>
  )
}
