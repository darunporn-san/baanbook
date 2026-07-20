alter table public.rooms
  add column if not exists window_count integer not null default 0,
  add column if not exists door_count integer not null default 0,
  add column if not exists balcony_count integer not null default 0;

alter table public.rooms
  drop constraint if exists rooms_window_count_non_negative,
  drop constraint if exists rooms_door_count_non_negative,
  drop constraint if exists rooms_balcony_count_non_negative;

alter table public.rooms
  add constraint rooms_window_count_non_negative check (window_count >= 0),
  add constraint rooms_door_count_non_negative check (door_count >= 0),
  add constraint rooms_balcony_count_non_negative check (balcony_count >= 0);
