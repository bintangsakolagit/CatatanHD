import type { Metadata } from 'next'
import { FormDaftar } from '@/components/auth/form-daftar'

export const metadata: Metadata = { title: 'Daftar' }

export default function HalamanDaftar() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          Akun pasien
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Buat akun CatatanHD</h1>
        <p className="text-sm text-muted">
          Data ini dipakai untuk menyesuaikan catatan dan pengingat pemeriksaan.
        </p>
      </div>

      <FormDaftar />

      <p className="border-t border-border/20 pt-4 text-xs leading-relaxed text-muted">
        Dengan mendaftar, Anda menyetujui catatan disimpan untuk keperluan pribadi. Akun yang tidak
        dipakai masuk selama 3 bulan akan dihapus beserta seluruh catatannya.
      </p>
    </div>
  )
}
