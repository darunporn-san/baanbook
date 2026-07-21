alter table public.comparison_options
  add column if not exists product_price_basis text not null default 'per_unit',
  add column if not exists installation_price_basis text not null default 'total';

alter table public.comparison_options
  drop constraint if exists comparison_options_product_basis_check;
alter table public.comparison_options
  add constraint comparison_options_product_basis_check check (
    product_price_basis in ('per_unit', 'total')
  );

alter table public.comparison_options
  drop constraint if exists comparison_options_installation_basis_check;
alter table public.comparison_options
  add constraint comparison_options_installation_basis_check check (
    installation_price_basis in ('per_unit', 'total')
  );
