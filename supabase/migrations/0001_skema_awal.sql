-- =============================================================================
-- CatatanHD - Skema awal
-- Seluruh tabel menyimpan data pasien hemodialisa. Penghapusan akun auth
-- otomatis menghapus profil dan seluruh catatan terkait lewat ON DELETE CASCADE.
-- =============================================================================

-- Fungsi umum untuk memperbarui kolom updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profil pasien dan super admin.
-- Email disimpan juga di sini agar panel admin bisa mencari tanpa membuka auth.users.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'pasien',
  username text not null,
  nama text not null,
  tanggal_lahir date not null,
  alamat text not null,
  bb_kering_kg numeric(5, 1) not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('pasien', 'super_admin')),
  constraint profiles_username_format check (username ~ '^[a-z0-9._]{3,30}$'),
  constraint profiles_bb_kering_rentang check (bb_kering_kg between 20 and 250)
);

-- Username dan email dibandingkan tanpa peduli huruf besar/kecil.
create unique index profiles_username_unik on public.profiles (lower(username));
create unique index profiles_email_unik on public.profiles (lower(email));

-- Pencarian akun pasif oleh job retensi.
create index profiles_last_login_idx on public.profiles (last_login_at);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Satu baris untuk satu sesi cuci darah. Satu pasien hanya boleh punya satu
-- catatan per tanggal agar histori tidak ambigu.
-- -----------------------------------------------------------------------------
create table public.dialysis_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  tanggal date not null,
  durasi_menit smallint not null,
  keluhan text,
  bb_kemarin_kg numeric(5, 1),
  bb_pra_kg numeric(5, 1) not null,
  bb_pasca_kg numeric(5, 1),
  tensi_pra_sistolik smallint not null,
  tensi_pra_diastolik smallint not null,
  tensi_pasca_sistolik smallint,
  tensi_pasca_diastolik smallint,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sesi_unik_per_tanggal unique (patient_id, tanggal),
  constraint sesi_durasi_valid check (durasi_menit in (300, 270, 240, 210, 180)),
  constraint sesi_bb_kemarin_rentang check (bb_kemarin_kg between 20 and 250),
  constraint sesi_bb_pra_rentang check (bb_pra_kg between 20 and 250),
  constraint sesi_bb_pasca_rentang check (bb_pasca_kg between 20 and 250),
  constraint sesi_tensi_pra_sistolik_rentang check (tensi_pra_sistolik between 50 and 300),
  constraint sesi_tensi_pra_diastolik_rentang check (tensi_pra_diastolik between 30 and 200),
  constraint sesi_tensi_pasca_sistolik_rentang check (tensi_pasca_sistolik between 50 and 300),
  constraint sesi_tensi_pasca_diastolik_rentang check (tensi_pasca_diastolik between 30 and 200),
  constraint sesi_tensi_pra_masuk_akal check (tensi_pra_sistolik > tensi_pra_diastolik),
  constraint sesi_tensi_pasca_masuk_akal check (
    tensi_pasca_sistolik is null
    or tensi_pasca_diastolik is null
    or tensi_pasca_sistolik > tensi_pasca_diastolik
  ),
  constraint sesi_tensi_pasca_lengkap check (
    (tensi_pasca_sistolik is null) = (tensi_pasca_diastolik is null)
  )
);

create index dialysis_sessions_pasien_tanggal_idx
  on public.dialysis_sessions (patient_id, tanggal desc);

create trigger dialysis_sessions_updated_at
before update on public.dialysis_sessions
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Pemeriksaan tensi berkala selama sesi berlangsung. Jumlah baris bebas.
-- -----------------------------------------------------------------------------
create table public.bp_readings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.dialysis_sessions (id) on delete cascade,
  jam time not null,
  sistolik smallint not null,
  diastolik smallint not null,
  nadi smallint,
  created_at timestamptz not null default now(),
  constraint tensi_sistolik_rentang check (sistolik between 50 and 300),
  constraint tensi_diastolik_rentang check (diastolik between 30 and 200),
  constraint tensi_nadi_rentang check (nadi between 20 and 250),
  constraint tensi_masuk_akal check (sistolik > diastolik)
);

create index bp_readings_sesi_idx on public.bp_readings (session_id, jam);

-- -----------------------------------------------------------------------------
-- Hasil laboratorium: HB bulanan, ureum dan kreatinin tahunan.
-- -----------------------------------------------------------------------------
create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  jenis text not null,
  nilai numeric(6, 2) not null,
  tanggal date not null,
  catatan text,
  created_at timestamptz not null default now(),
  constraint lab_jenis_valid check (jenis in ('hb', 'ureum', 'kreatinin')),
  constraint lab_nilai_positif check (nilai > 0)
);

create index lab_results_pasien_idx on public.lab_results (patient_id, jenis, tanggal desc);

-- -----------------------------------------------------------------------------
-- Jejak aksi admin. target_id tidak memakai foreign key karena akun target
-- bisa saja sudah dihapus dan jejaknya tetap perlu disimpan.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  aktor_id uuid references public.profiles (id) on delete set null,
  aksi text not null,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_target_idx on public.audit_logs (target_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Catatan peringatan retensi agar email yang sama tidak terkirim berulang.
-- -----------------------------------------------------------------------------
create table public.retention_notices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  tahap text not null,
  terkirim_at timestamptz not null default now(),
  constraint retention_tahap_valid check (tahap in ('h30', 'h7')),
  constraint retention_unik_per_tahap unique (patient_id, tahap)
);
