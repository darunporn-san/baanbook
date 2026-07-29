alter table if exists public.expenses
add column if not exists payment_plan_type text;

alter table if exists public.expenses
drop constraint if exists expenses_payment_plan_type_check;

alter table if exists public.expenses
add constraint expenses_payment_plan_type_check check (
  payment_plan_type is null
  or payment_plan_type in ('monthly', 'staged')
);

create table if not exists public.expense_installment_payments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  payment_date date not null default current_date,
  amount_minor integer not null check (amount_minor > 0),
  created_at timestamptz not null default now()
);

alter table if exists public.expense_installment_payments disable row level security;

create index if not exists expense_installment_payments_expense_date_idx
on public.expense_installment_payments(expense_id, payment_date desc);
