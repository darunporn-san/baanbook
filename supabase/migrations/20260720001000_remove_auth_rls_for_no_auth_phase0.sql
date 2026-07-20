drop policy if exists "Members can read homes" on public.homes;
drop policy if exists "Users can create owned homes" on public.homes;
drop policy if exists "Editors can update homes" on public.homes;
drop policy if exists "Members can read rooms" on public.rooms;
drop policy if exists "Editors can create rooms" on public.rooms;
drop policy if exists "Editors can update rooms" on public.rooms;
drop policy if exists "Editors can delete rooms" on public.rooms;
drop policy if exists "Members can read memberships" on public.home_members;
drop policy if exists "Home owners can create memberships" on public.home_members;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_home_member(uuid) cascade;
drop function if exists public.can_edit_home(uuid) cascade;

drop table if exists public.home_members cascade;
drop table if exists public.profiles cascade;

alter table if exists public.homes drop column if exists owner_id cascade;
alter table if exists public.homes disable row level security;
alter table if exists public.rooms disable row level security;

