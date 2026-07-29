alter table if exists public.comparison_options
add column if not exists has_installation boolean not null default true;
