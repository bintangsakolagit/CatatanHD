import type { Metadata } from 'next'
import { FormMasuk } from '@/components/auth/form-masuk'
import { Peringatan } from '@/components/ui/peringatan'

export const metadata: Metadata = { title: 'Masuk' }

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string; verifikasi?: string; galat?: string }>
}) {
  const parameter = await searchParams

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          Catatan hemodialisa
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Masuk ke catatan Anda</h1>
        <p className="text-sm text-muted">Gunakan email dan password yang didaftarkan.</p>
      </div>

      {parameter.verifikasi === '1' ? (
        <Peringatan jenis="sukses">Email sudah terverifikasi. Silakan masuk.</Peringatan>
      ) : null}

      {parameter.galat === 'tautan' ? (
        <Peringatan jenis="galat">
          Tautan verifikasi tidak lengkap. Buka kembali tautan terbaru dari email.
        </Peringatan>
      ) : null}

      {parameter.galat === 'verifikasi' ? (
        <Peringatan jenis="galat">
          Verifikasi gagal atau tautan sudah kedaluwarsa. Minta tautan baru ke admin.
        </Peringatan>
      ) : null}

      <FormMasuk lanjut={parameter.lanjut} />

      <p className="border-t border-border/20 pt-4 text-xs leading-relaxed text-muted">
        Catatan ini hanya bisa dilihat oleh Anda dan admin unit. Data disimpan di server dan tidak
        dibagikan ke pihak lain.
      </p>
    </div>
  )
}
