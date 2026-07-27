alter table public.mortgage_profiles
add column if not exists payment_due_day smallint not null default 31;

alter table public.mortgage_profiles
drop constraint if exists mortgage_profiles_payment_due_day_check;

alter table public.mortgage_profiles
add constraint mortgage_profiles_payment_due_day_check
check (payment_due_day between 1 and 31);
