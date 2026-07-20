create extension if not exists "pgcrypto";

create table public.homes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  home_type text,
  ownership_type text,
  address_line text,
  city text,
  province text,
  country text,
  postal_code text,
  move_in_date date,
  default_currency text not null default 'THB',
  timezone text not null default 'Asia/Bangkok',
  cover_image_path text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homes_default_currency_length check (char_length(default_currency) = 3)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  name text not null,
  floor text,
  zone text,
  room_type text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index homes_archived_at_idx on public.homes(archived_at);
create index rooms_home_id_idx on public.rooms(home_id);
create index rooms_home_id_deleted_at_idx on public.rooms(home_id, deleted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger homes_set_updated_at
before update on public.homes
for each row execute function public.set_updated_at();

create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

