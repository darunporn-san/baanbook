create table if not exists public.expense_budgets (
  home_id uuid not null references public.homes(id) on delete cascade,
  month_start date not null,
  amount_minor integer not null check (amount_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (home_id, month_start),
  constraint expense_budgets_month_start_check
    check (month_start = date_trunc('month', month_start)::date)
);

alter table public.expense_budgets disable row level security;

drop trigger if exists expense_budgets_set_updated_at on public.expense_budgets;
create trigger expense_budgets_set_updated_at
before update on public.expense_budgets
for each row execute function public.set_updated_at();
