-- =============================================================================
-- Row Level Security
-- Semua tabel ditutup, lalu dibuka hanya untuk pemilik data atau super admin.
-- Akses service role melewati RLS dan hanya dipakai di lapisan server.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.dialysis_sessions enable row level security;
alter table public.bp_readings enable row level security;
alter table public.lab_results enable row level security;
alter table public.audit_logs enable row level security;
alter table public.retention_notices enable row level security;

-- Helper diletakkan di schema private agar tidak ikut terekspos sebagai RPC.
create schema if not exists private;

grant usage on schema private to authenticated, service_role;

-- SECURITY DEFINER diperlukan supaya pengecekan role tidak memicu rekursi policy
-- pada tabel profiles itu sendiri.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
      and is_active
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Profil: pemilik boleh membaca dan menyunting kolom dasar saja.
-- Role, status aktif, dan email hanya bisa diubah lewat service role / admin.
-- -----------------------------------------------------------------------------
create policy "profil sendiri atau admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or private.is_admin());

create policy "ubah profil sendiri"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "admin ubah semua profil"
on public.profiles for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

-- Pembatasan di tingkat kolom, sebagai lapisan kedua setelah trigger.
revoke update on public.profiles from authenticated;
grant update (nama, username, tanggal_lahir, alamat, bb_kering_kg)
  on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Sesi cuci darah: hanya milik sendiri, admin boleh melihat semuanya.
-- -----------------------------------------------------------------------------
create policy "sesi milik sendiri atau admin"
on public.dialysis_sessions for all
to authenticated
using (patient_id = auth.uid() or private.is_admin())
with check (patient_id = auth.uid() or private.is_admin());

-- -----------------------------------------------------------------------------
-- Tensi berkala mengikuti hak akses sesi induknya.
-- -----------------------------------------------------------------------------
create policy "tensi mengikuti sesi"
on public.bp_readings for all
to authenticated
using (
  exists (
    select 1
    from public.dialysis_sessions s
    where s.id = bp_readings.session_id
      and (s.patient_id = auth.uid() or private.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.dialysis_sessions s
    where s.id = bp_readings.session_id
      and (s.patient_id = auth.uid() or private.is_admin())
  )
);

-- -----------------------------------------------------------------------------
-- Hasil laboratorium.
-- -----------------------------------------------------------------------------
create policy "lab milik sendiri atau admin"
on public.lab_results for all
to authenticated
using (patient_id = auth.uid() or private.is_admin())
with check (patient_id = auth.uid() or private.is_admin());

-- -----------------------------------------------------------------------------
-- Audit hanya bisa dibaca admin. Penulisan dilakukan service role.
-- -----------------------------------------------------------------------------
create policy "admin baca audit"
on public.audit_logs for select
to authenticated
using (private.is_admin());

-- retention_notices sengaja tidak diberi policy: hanya service role yang boleh
-- membaca dan menulis, sehingga tabel ini tertutup total dari browser.
