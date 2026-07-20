select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('renovation_projects', 'shopping_items')
order by c.relname;

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('renovation_projects', 'shopping_items')
order by event_object_table, trigger_name;
