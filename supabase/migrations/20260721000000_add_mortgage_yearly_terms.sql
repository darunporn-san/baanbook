create table if not exists public.mortgage_yearly_terms (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  mortgage_profile_id uuid not null references public.mortgage_profiles(id) on delete cascade,
  loan_year integer not null,
  annual_interest_rate numeric(6, 3) not null,
  monthly_payment_minor integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint mortgage_yearly_terms_year_positive check (loan_year > 0),
  constraint mortgage_yearly_terms_interest_non_negative check (annual_interest_rate >= 0),
  constraint mortgage_yearly_terms_payment_positive check (monthly_payment_minor is null or monthly_payment_minor > 0)
);

insert into public.mortgage_yearly_terms (
  home_id,
  mortgage_profile_id,
  loan_year,
  annual_interest_rate,
  monthly_payment_minor
)
select
  home_id,
  id,
  1,
  annual_interest_rate,
  monthly_payment_minor
from public.mortgage_profiles
where deleted_at is null
  and not exists (
    select 1
    from public.mortgage_yearly_terms
    where mortgage_profile_id = mortgage_profiles.id
      and loan_year = 1
      and deleted_at is null
  );

create unique index if not exists mortgage_yearly_terms_profile_year_idx
  on public.mortgage_yearly_terms(mortgage_profile_id, loan_year)
  where deleted_at is null;

drop trigger if exists mortgage_yearly_terms_set_updated_at on public.mortgage_yearly_terms;
create trigger mortgage_yearly_terms_set_updated_at
before update on public.mortgage_yearly_terms
for each row execute function public.set_updated_at();

alter table public.mortgage_yearly_terms disable row level security;
