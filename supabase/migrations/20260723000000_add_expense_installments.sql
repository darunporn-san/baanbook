alter table if exists public.expenses
add column if not exists installment_months integer,
add column if not exists installment_amount_minor integer;

alter table if exists public.expenses
drop constraint if exists expenses_installment_values_check;

alter table if exists public.expenses
add constraint expenses_installment_values_check check (
  (installment_months is null and installment_amount_minor is null)
  or (
    installment_months > 0
    and installment_amount_minor >= 0
  )
);
