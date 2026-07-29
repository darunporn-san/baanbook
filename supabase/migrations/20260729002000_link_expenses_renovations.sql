alter table if exists public.expenses
add column if not exists renovation_project_id uuid
references public.renovation_projects(id) on delete set null;

create index if not exists expenses_renovation_project_id_idx
on public.expenses(renovation_project_id)
where deleted_at is null;
