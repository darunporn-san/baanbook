alter table public.homes
  drop constraint if exists homes_width_m_non_negative,
  drop constraint if exists homes_length_m_non_negative,
  drop constraint if exists homes_height_m_non_negative;

alter table public.homes
  drop column if exists width_m,
  drop column if exists length_m,
  drop column if exists height_m;

alter table public.rooms
  add column if not exists width_m numeric(10, 2),
  add column if not exists length_m numeric(10, 2),
  add column if not exists height_m numeric(10, 2);

alter table public.rooms
  drop constraint if exists rooms_width_m_non_negative,
  drop constraint if exists rooms_length_m_non_negative,
  drop constraint if exists rooms_height_m_non_negative;

alter table public.rooms
  add constraint rooms_width_m_non_negative check (width_m is null or width_m >= 0),
  add constraint rooms_length_m_non_negative check (length_m is null or length_m >= 0),
  add constraint rooms_height_m_non_negative check (height_m is null or height_m >= 0);
