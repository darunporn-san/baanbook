create table if not exists public.mortgage_profiles (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  lender_name text not null,
  principal_minor integer not null,
  annual_interest_rate numeric(6, 3) not null default 0,
  term_months integer not null,
  start_date date not null,
  monthly_payment_minor integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint mortgage_profiles_principal_positive check (principal_minor > 0),
  constraint mortgage_profiles_term_positive check (term_months > 0),
  constraint mortgage_profiles_interest_non_negative check (annual_interest_rate >= 0),
  constraint mortgage_profiles_monthly_payment_non_negative check (monthly_payment_minor is null or monthly_payment_minor >= 0)
);

create table if not exists public.mortgage_payments (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  mortgage_profile_id uuid not null references public.mortgage_profiles(id) on delete cascade,
  payment_date date not null,
  amount_minor integer not null,
  principal_minor integer,
  interest_minor integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint mortgage_payments_amount_positive check (amount_minor > 0),
  constraint mortgage_payments_principal_non_negative check (principal_minor is null or principal_minor >= 0),
  constraint mortgage_payments_interest_non_negative check (interest_minor is null or interest_minor >= 0)
);

create index if not exists mortgage_profiles_home_idx
  on public.mortgage_profiles(home_id)
  where deleted_at is null;

create index if not exists mortgage_payments_profile_date_idx
  on public.mortgage_payments(mortgage_profile_id, payment_date)
  where deleted_at is null;

drop trigger if exists mortgage_profiles_set_updated_at on public.mortgage_profiles;
create trigger mortgage_profiles_set_updated_at
before update on public.mortgage_profiles
for each row execute function public.set_updated_at();

drop trigger if exists mortgage_payments_set_updated_at on public.mortgage_payments;
create trigger mortgage_payments_set_updated_at
before update on public.mortgage_payments
for each row execute function public.set_updated_at();

alter table public.mortgage_profiles disable row level security;
alter table public.mortgage_payments disable row level security;
