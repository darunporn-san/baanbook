create table public.expense_budgets_total (
  home_id uuid primary key references public.homes(id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.expense_budgets_total (home_id, amount_minor)
select
  home_id,
  coalesce(
    max(amount_minor) filter (where month_start = '1970-01-01'),
    sum(amount_minor)
  )::integer
from public.expense_budgets
where amount_minor > 0
group by home_id;

drop table public.expense_budgets;
alter table public.expense_budgets_total rename to expense_budgets;

alter table public.expense_budgets disable row level security;

create trigger expense_budgets_set_updated_at
before update on public.expense_budgets
for each row execute function public.set_updated_at();

create or replace function public.add_expense_budget(
  p_home_id uuid,
  p_amount_minor integer
)
returns void
language sql
as $$
  update public.expense_budgets
  set amount_minor = amount_minor + p_amount_minor
  where home_id = p_home_id and p_amount_minor > 0;
$$;
