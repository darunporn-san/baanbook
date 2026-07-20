alter table public.expenses
  add column if not exists notes text;
