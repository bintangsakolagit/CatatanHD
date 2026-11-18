-- =============================================================================
-- Izin tabel untuk role Supabase
--
-- Project Supabase baru tidak lagi memberi hak otomatis pada skema public.
-- Tanpa GRANT di bawah ini, PostgREST menolak dengan
-- "permission denied for table ..." walaupun RLS sudah benar, karena
-- pemeriksaan izin tabel terjadi lebih dahulu daripada RLS.
--
-- GRANT hanya membuka tabel; pembatasan baris tetap dilakukan RLS.
-- Sengaja tidak memakai "grant all on all tables", sebab tabel profiles
-- memakai izin per kolom (lihat 0002_rls.sql).
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Profil: pasien membaca miliknya, menyunting kolom dasar saja. Penulisan
-- profil baru dilakukan service role saat pendaftaran.
-- -----------------------------------------------------------------------------
grant select on public.profiles to authenticated;

revoke update on public.profiles from authenticated;
grant update (nama, username, tanggal_lahir, alamat, bb_kering_kg)
  on public.profiles to authenticated;

grant select, insert, update, delete on public.profiles to service_role;

-- -----------------------------------------------------------------------------
-- Data klinis: RLS membatasi ke pemilik data atau super admin.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.dialysis_sessions to authenticated;
grant select, insert, update, delete on public.bp_readings to authenticated;
grant select, insert, update, delete on public.lab_results to authenticated;

grant select, insert, update, delete on public.dialysis_sessions to service_role;
grant select, insert, update, delete on public.bp_readings to service_role;
grant select, insert, update, delete on public.lab_results to service_role;

-- -----------------------------------------------------------------------------
-- Audit: admin boleh membaca lewat policy, penulisan hanya service role.
-- -----------------------------------------------------------------------------
grant select on public.audit_logs to authenticated;
grant select, insert, update, delete on public.audit_logs to service_role;

-- -----------------------------------------------------------------------------
-- Peringatan retensi: tertutup sepenuhnya dari browser.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.retention_notices to service_role;

-- -----------------------------------------------------------------------------
-- Urutan dipakai bila kelak ada kolom bigserial.
-- -----------------------------------------------------------------------------
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Tabel dan urutan pada migrasi berikutnya mengikuti izin yang sama.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
