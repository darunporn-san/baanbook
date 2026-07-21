alter table if exists public.expenses
add column if not exists is_paid boolean not null default true;
