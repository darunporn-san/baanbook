create table if not exists public.room_openings (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  opening_type text not null,
  label text,
  width_m numeric(10, 2),
  height_m numeric(10, 2),
  quantity integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint room_openings_type_check check (
    opening_type in ('window', 'door', 'balcony', 'other')
  ),
  constraint room_openings_width_non_negative check (width_m is null or width_m >= 0),
  constraint room_openings_height_non_negative check (height_m is null or height_m >= 0),
  constraint room_openings_quantity_positive check (quantity > 0)
);

create index if not exists room_openings_home_id_idx
  on public.room_openings(home_id)
  where deleted_at is null;

create index if not exists room_openings_room_id_idx
  on public.room_openings(room_id)
  where deleted_at is null;

drop trigger if exists room_openings_set_updated_at on public.room_openings;
create trigger room_openings_set_updated_at
before update on public.room_openings
for each row execute function public.set_updated_at();

alter table public.room_openings disable row level security;
