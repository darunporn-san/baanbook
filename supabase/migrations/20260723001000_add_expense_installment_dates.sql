alter table if exists public.expenses
add column if not exists installment_start_date date,
add column if not exists installment_end_date date;

alter table if exists public.expenses
drop constraint if exists expenses_installment_dates_check;

alter table if exists public.expenses
add constraint expenses_installment_dates_check check (
  (installment_start_date is null and installment_end_date is null)
  or (
    installment_start_date is not null
    and installment_end_date >= installment_start_date
  )
);
