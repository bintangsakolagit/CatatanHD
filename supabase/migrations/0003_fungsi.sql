-- =============================================================================
-- Fungsi yang dipanggil dari lapisan server.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Mencatat waktu masuk terakhir. Dipanggil setelah login berhasil.
-- SECURITY DEFINER dipakai agar pasien tidak butuh izin menulis kolom ini.
-- -----------------------------------------------------------------------------
create or replace function public.catat_login()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.profiles
  set last_login_at = now()
  where id = auth.uid();
$$;

revoke all on function public.catat_login() from public;
grant execute on function public.catat_login() to authenticated;

-- -----------------------------------------------------------------------------
-- Ringkasan histori pada rentang tanggal.
-- SECURITY INVOKER: RLS tetap berlaku, dan filter patient_id memastikan hasil
-- hanya berasal dari catatan milik pengguna yang sedang masuk.
-- -----------------------------------------------------------------------------
create or replace function public.ringkasan_histori(p_dari date, p_sampai date)
returns table (
  total_sesi bigint,
  rata_turun_bb numeric,
  rata_sistolik numeric,
  rata_diastolik numeric,
  durasi_tersering smallint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with sesi as (
    select *
    from public.dialysis_sessions
    where patient_id = auth.uid()
      and tanggal between p_dari and p_sampai
  )
  select
    count(*)::bigint as total_sesi,
    avg(bb_pra_kg - bb_pasca_kg) filter (where bb_pasca_kg is not null) as rata_turun_bb,
    avg(tensi_pra_sistolik)::numeric as rata_sistolik,
    avg(tensi_pra_diastolik)::numeric as rata_diastolik,
    (
      select durasi_menit
      from sesi
      group by durasi_menit
      order by count(*) desc, durasi_menit desc
      limit 1
    ) as durasi_tersering
  from sesi;
$$;

revoke all on function public.ringkasan_histori(date, date) from public;
grant execute on function public.ringkasan_histori(date, date) to authenticated;

-- -----------------------------------------------------------------------------
-- Daftar akun pasien yang tidak aktif, untuk job retensi.
--
-- Hanya akun yang benar-benar butuh tindakan yang dikembalikan:
--   * tidak aktif >= 90 hari              -> hapus akun
--   * tidak aktif 60-89 hari, belum h30   -> kirim peringatan 30 hari
--   * tidak aktif 83-89 hari, belum h7    -> kirim peringatan 7 hari
-- Filter tahap ini mencegah antrean macet oleh akun yang peringatannya sudah
-- terkirim. Tanpa filter, akun tertua akan terus muncul dan menahan akun lain.
-- Hanya service role yang boleh memanggil fungsi ini.
-- -----------------------------------------------------------------------------
create or replace function public.cari_akun_pasif(batas integer default 50)
returns table (id uuid, email text, nama text, hari integer)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with aktivitas as (
    select
      p.id,
      u.email::text as email,
      p.nama,
      greatest(
        coalesce(p.last_login_at, 'epoch'::timestamptz),
        coalesce(u.last_sign_in_at, 'epoch'::timestamptz),
        u.created_at
      ) as terakhir
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'pasien'
      and p.is_active
  ),
  kandidat as (
    select
      a.id,
      a.email,
      a.nama,
      floor(extract(epoch from (now() - a.terakhir)) / 86400)::integer as hari,
      a.terakhir
    from aktivitas a
  )
  select k.id, k.email, k.nama, k.hari
  from kandidat k
  where
    k.hari >= 90
    or (
      k.hari >= 60
      and k.hari < 90
      and not exists (
        select 1 from public.retention_notices n
        where n.patient_id = k.id and n.tahap = 'h30'
      )
    )
    or (
      k.hari >= 83
      and k.hari < 90
      and not exists (
        select 1 from public.retention_notices n
        where n.patient_id = k.id and n.tahap = 'h7'
      )
    )
  order by k.terakhir asc
  limit coalesce(batas, 50);
$$;

revoke all on function public.cari_akun_pasif(integer) from public;
grant execute on function public.cari_akun_pasif(integer) to service_role;
