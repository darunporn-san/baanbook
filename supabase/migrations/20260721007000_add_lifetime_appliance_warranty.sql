alter table if exists public.appliances
add column if not exists warranty_lifetime boolean not null default false;
