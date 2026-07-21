create table if not exists public.mortgage_rate_cycles (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  mortgage_profile_id uuid not null references public.mortgage_profiles(id) on delete cascade,
  cycle_number integer not null,
  change_type text,
  lender_name text not null,
  start_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint mortgage_rate_cycles_number_positive check (cycle_number > 0),
  constraint mortgage_rate_cycles_change_type_check
    check (change_type is null or change_type in ('refinance', 'retention'))
);

create unique index if not exists mortgage_rate_cycles_profile_number_idx
  on public.mortgage_rate_cycles(mortgage_profile_id, cycle_number)
  where deleted_at is null;

insert into public.mortgage_rate_cycles (
  home_id,
  mortgage_profile_id,
  cycle_number,
  lender_name,
  start_date
)
select home_id, id, 1, lender_name, start_date
from public.mortgage_profiles
where not exists (
  select 1
  from public.mortgage_rate_cycles
  where mortgage_profile_id = mortgage_profiles.id
    and cycle_number = 1
    and deleted_at is null
);

alter table public.mortgage_yearly_terms
  add column if not exists mortgage_rate_cycle_id uuid
    references public.mortgage_rate_cycles(id) on delete cascade;

update public.mortgage_yearly_terms terms
set mortgage_rate_cycle_id = cycles.id
from public.mortgage_rate_cycles cycles
where terms.mortgage_rate_cycle_id is null
  and cycles.mortgage_profile_id = terms.mortgage_profile_id
  and cycles.cycle_number = 1
  and cycles.deleted_at is null;

alter table public.mortgage_yearly_terms
  alter column mortgage_rate_cycle_id set not null;

drop index if exists public.mortgage_yearly_terms_profile_year_idx;

create unique index if not exists mortgage_yearly_terms_cycle_year_idx
  on public.mortgage_yearly_terms(mortgage_rate_cycle_id, loan_year)
  where deleted_at is null;

drop trigger if exists mortgage_rate_cycles_set_updated_at on public.mortgage_rate_cycles;
create trigger mortgage_rate_cycles_set_updated_at
before update on public.mortgage_rate_cycles
for each row execute function public.set_updated_at();

alter table public.mortgage_rate_cycles disable row level security;
