alter table public.expenses
  add column if not exists appointment_date date,
  add column if not exists appointment_time text;
