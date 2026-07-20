create table if not exists public.renovation_projects (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  status text not null default 'planning',
  contractor_name text,
  budget_minor integer not null default 0,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint renovation_projects_status_check check (
    status in ('planning', 'active', 'paused', 'completed', 'cancelled')
  ),
  constraint renovation_projects_budget_non_negative check (budget_minor >= 0)
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  renovation_project_id uuid references public.renovation_projects(id) on delete set null,
  title text not null,
  status text not null default 'planned',
  priority text not null default 'medium',
  estimated_price_minor integer,
  actual_price_minor integer,
  vendor text,
  product_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint shopping_items_status_check check (status in ('planned', 'bought', 'cancelled')),
  constraint shopping_items_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint shopping_items_estimated_non_negative check (estimated_price_minor is null or estimated_price_minor >= 0),
  constraint shopping_items_actual_non_negative check (actual_price_minor is null or actual_price_minor >= 0)
);

create index if not exists renovation_projects_home_status_idx
  on public.renovation_projects(home_id, status)
  where deleted_at is null;

create index if not exists shopping_items_home_status_idx
  on public.shopping_items(home_id, status)
  where deleted_at is null;

drop trigger if exists renovation_projects_set_updated_at on public.renovation_projects;
create trigger renovation_projects_set_updated_at
before update on public.renovation_projects
for each row execute function public.set_updated_at();

drop trigger if exists shopping_items_set_updated_at on public.shopping_items;
create trigger shopping_items_set_updated_at
before update on public.shopping_items
for each row execute function public.set_updated_at();

alter table public.renovation_projects disable row level security;
alter table public.shopping_items disable row level security;
