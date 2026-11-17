/**
 * Tipe database yang mencerminkan migrasi di folder supabase/migrations.
 * Bentuknya mengikuti hasil `supabase gen types typescript` agar bisa diganti
 * otomatis lewat `npm run db:types` tanpa mengubah kode pemanggil.
 */

export type PeranPengguna = 'pasien' | 'super_admin'
export type JenisLab = 'hb' | 'ureum' | 'kreatinin'
export type TahapPeringatan = 'h30' | 'h7'

export type Profil = {
  id: string
  email: string
  role: PeranPengguna
  username: string
  nama: string
  tanggal_lahir: string
  alamat: string
  bb_kering_kg: number
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type SesiDialisis = {
  id: string
  patient_id: string
  tanggal: string
  durasi_menit: number
  keluhan: string | null
  bb_kemarin_kg: number | null
  bb_pra_kg: number
  bb_pasca_kg: number | null
  tensi_pra_sistolik: number
  tensi_pra_diastolik: number
  tensi_pasca_sistolik: number | null
  tensi_pasca_diastolik: number | null
  catatan: string | null
  created_at: string
  updated_at: string
}

export type BacaanTensi = {
  id: string
  session_id: string
  jam: string
  sistolik: number
  diastolik: number
  nadi: number | null
  created_at: string
}

export type HasilLab = {
  id: string
  patient_id: string
  jenis: JenisLab
  nilai: number
  tanggal: string
  catatan: string | null
  created_at: string
}

export type CatatanAudit = {
  id: string
  aktor_id: string | null
  aksi: string
  target_id: string | null
  detail: Record<string, unknown> | null
  created_at: string
}

export type PeringatanRetensi = {
  id: string
  patient_id: string
  tahap: TahapPeringatan
  terkirim_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profil
        Insert: {
          id: string
          email: string
          role?: PeranPengguna
          username: string
          nama: string
          tanggal_lahir: string
          alamat: string
          bb_kering_kg: number
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          role?: PeranPengguna
          username?: string
          nama?: string
          tanggal_lahir?: string
          alamat?: string
          bb_kering_kg?: number
          is_active?: boolean
          last_login_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dialysis_sessions: {
        Row: SesiDialisis
        Insert: {
          id?: string
          patient_id: string
          tanggal: string
          durasi_menit: number
          keluhan?: string | null
          bb_kemarin_kg?: number | null
          bb_pra_kg: number
          bb_pasca_kg?: number | null
          tensi_pra_sistolik: number
          tensi_pra_diastolik: number
          tensi_pasca_sistolik?: number | null
          tensi_pasca_diastolik?: number | null
          catatan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tanggal?: string
          durasi_menit?: number
          keluhan?: string | null
          bb_kemarin_kg?: number | null
          bb_pra_kg?: number
          bb_pasca_kg?: number | null
          tensi_pra_sistolik?: number
          tensi_pra_diastolik?: number
          tensi_pasca_sistolik?: number | null
          tensi_pasca_diastolik?: number | null
          catatan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bp_readings: {
        Row: BacaanTensi
        Insert: {
          id?: string
          session_id: string
          jam: string
          sistolik: number
          diastolik: number
          nadi?: number | null
          created_at?: string
        }
        Update: {
          jam?: string
          sistolik?: number
          diastolik?: number
          nadi?: number | null
        }
        Relationships: []
      }
      lab_results: {
        Row: HasilLab
        Insert: {
          id?: string
          patient_id: string
          jenis: JenisLab
          nilai: number
          tanggal: string
          catatan?: string | null
          created_at?: string
        }
        Update: {
          jenis?: JenisLab
          nilai?: number
          tanggal?: string
          catatan?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: CatatanAudit
        Insert: {
          id?: string
          aktor_id?: string | null
          aksi: string
          target_id?: string | null
          detail?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          aktor_id?: string | null
          aksi?: string
          target_id?: string | null
          detail?: Record<string, unknown> | null
        }
        Relationships: []
      }
      retention_notices: {
        Row: PeringatanRetensi
        Insert: {
          id?: string
          patient_id: string
          tahap: TahapPeringatan
          terkirim_at?: string
        }
        Update: {
          tahap?: TahapPeringatan
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      catat_login: {
        Args: Record<string, never>
        Returns: undefined
      }
      cari_akun_pasif: {
        Args: { batas?: number }
        Returns: { id: string; email: string | null; nama: string | null; hari: number }[]
      }
      ringkasan_histori: {
        Args: { p_dari: string; p_sampai: string }
        Returns: {
          total_sesi: number
          rata_turun_bb: number | null
          rata_sistolik: number | null
          rata_diastolik: number | null
          durasi_tersering: number | null
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
