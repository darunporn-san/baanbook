alter table public.comparison_options
  add column if not exists quantity integer not null default 1;

alter table public.comparison_options
  drop constraint if exists comparison_options_quantity_check;
alter table public.comparison_options
  add constraint comparison_options_quantity_check check (quantity >= 1);
