create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  category text not null default 'other',
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null default 'THB',
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.appliances (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  brand text,
  model text,
  purchase_date date,
  warranty_end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  document_type text not null default 'other',
  storage_bucket text,
  storage_path text,
  file_name text,
  file_mime_type text,
  file_size_bytes integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  event_date timestamptz not null default now(),
  source_type text,
  source_id uuid,
  room_id uuid references public.rooms(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table if exists public.expenses disable row level security;
alter table if exists public.appliances disable row level security;
alter table if exists public.documents disable row level security;
alter table if exists public.timeline_events disable row level security;

create index if not exists expenses_home_id_expense_date_idx on public.expenses(home_id, expense_date);
create index if not exists expenses_home_id_deleted_at_idx on public.expenses(home_id, deleted_at);
create index if not exists appliances_home_id_deleted_at_idx on public.appliances(home_id, deleted_at);
create index if not exists documents_home_id_deleted_at_idx on public.documents(home_id, deleted_at);
create index if not exists timeline_events_home_id_event_date_idx on public.timeline_events(home_id, event_date);

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists appliances_set_updated_at on public.appliances;
create trigger appliances_set_updated_at
before update on public.appliances
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('home-documents', 'home-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "No-auth document uploads" on storage.objects;
create policy "No-auth document uploads"
on storage.objects for insert
to anon
with check (bucket_id = 'home-documents');

drop policy if exists "No-auth document reads" on storage.objects;
create policy "No-auth document reads"
on storage.objects for select
to anon
using (bucket_id = 'home-documents');
