select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('mortgage_profiles', 'mortgage_payments', 'mortgage_yearly_terms', 'mortgage_rate_cycles')
order by c.relname;

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('mortgage_profiles', 'mortgage_payments', 'mortgage_yearly_terms', 'mortgage_rate_cycles')
order by event_object_table, trigger_name;
