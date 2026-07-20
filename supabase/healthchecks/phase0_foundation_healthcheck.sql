select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('homes', 'rooms', 'expenses', 'appliances', 'documents', 'timeline_events')
order by c.relname;

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('homes', 'rooms', 'expenses', 'appliances', 'documents')
order by event_object_table, trigger_name;

select id, name, public
from storage.buckets
where id = 'home-documents'
order by id;

select
  routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'set_updated_at'
order by routine_name;

select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'expenses'
  and column_name in ('notes', 'appointment_date', 'appointment_time')
order by column_name;
