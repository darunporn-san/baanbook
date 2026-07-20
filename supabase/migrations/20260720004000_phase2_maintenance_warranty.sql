create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  appliance_id uuid references public.appliances(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint maintenance_tasks_status_check check (
    status in ('todo', 'scheduled', 'in_progress', 'done', 'skipped', 'cancelled')
  ),
  constraint maintenance_tasks_priority_check check (
    priority in ('low', 'medium', 'high', 'urgent')
  )
);

create index if not exists maintenance_tasks_home_status_idx
  on public.maintenance_tasks(home_id, status)
  where deleted_at is null;

create index if not exists maintenance_tasks_home_due_date_idx
  on public.maintenance_tasks(home_id, due_date)
  where deleted_at is null;

create index if not exists maintenance_tasks_home_appliance_idx
  on public.maintenance_tasks(home_id, appliance_id)
  where deleted_at is null;

drop trigger if exists maintenance_tasks_set_updated_at on public.maintenance_tasks;
create trigger maintenance_tasks_set_updated_at
before update on public.maintenance_tasks
for each row execute function public.set_updated_at();

alter table public.maintenance_tasks disable row level security;
