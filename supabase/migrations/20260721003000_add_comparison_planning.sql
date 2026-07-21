create table if not exists public.comparison_plans (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  destination_type text not null,
  status text not null default 'comparing',
  notes text,
  selected_option_id uuid,
  destination_id uuid,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint comparison_plans_destination_check check (
    destination_type in ('shopping', 'maintenance', 'renovation')
  ),
  constraint comparison_plans_status_check check (
    status in ('comparing', 'confirmed')
  )
);

create table if not exists public.comparison_options (
  id uuid primary key default gen_random_uuid(),
  comparison_plan_id uuid not null references public.comparison_plans(id) on delete cascade,
  home_id uuid not null references public.homes(id) on delete cascade,
  provider_name text not null,
  item_name text,
  product_price_minor integer not null default 0,
  product_price_basis text not null default 'per_unit',
  quantity integer not null default 1,
  installation_price_minor integer not null default 0,
  installation_price_basis text not null default 'total',
  currency text not null default 'THB',
  product_url text,
  notes text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint comparison_options_product_price_check check (product_price_minor >= 0),
  constraint comparison_options_product_basis_check check (
    product_price_basis in ('per_unit', 'total')
  ),
  constraint comparison_options_quantity_check check (quantity >= 1),
  constraint comparison_options_installation_price_check check (installation_price_minor >= 0),
  constraint comparison_options_installation_basis_check check (
    installation_price_basis in ('per_unit', 'total')
  )
);

alter table public.comparison_plans
  drop constraint if exists comparison_plans_selected_option_id_fkey;
alter table public.comparison_plans
  add constraint comparison_plans_selected_option_id_fkey
  foreign key (selected_option_id) references public.comparison_options(id) on delete set null;

create index if not exists comparison_plans_home_status_idx
  on public.comparison_plans(home_id, status)
  where deleted_at is null;

create index if not exists comparison_options_plan_idx
  on public.comparison_options(comparison_plan_id)
  where deleted_at is null;

drop trigger if exists comparison_plans_set_updated_at on public.comparison_plans;
create trigger comparison_plans_set_updated_at
before update on public.comparison_plans
for each row execute function public.set_updated_at();

drop trigger if exists comparison_options_set_updated_at on public.comparison_options;
create trigger comparison_options_set_updated_at
before update on public.comparison_options
for each row execute function public.set_updated_at();

alter table public.comparison_plans disable row level security;
alter table public.comparison_options disable row level security;
