select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('maintenance_tasks', 'room_openings')
order by c.relname;

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('maintenance_tasks', 'room_openings')
order by event_object_table, trigger_name;

select
  indexname,
  tablename
from pg_indexes
where schemaname = 'public'
  and tablename in ('maintenance_tasks', 'room_openings')
order by indexname;

select
  table_name,
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
from information_schema.columns
where table_schema = 'public'
  and table_name = 'rooms'
  and column_name in (
    'width_m',
    'length_m',
    'height_m',
    'window_count',
    'door_count',
    'balcony_count'
  )
order by column_name;

select
  table_name,
  constraint_name
from information_schema.table_constraints
where table_schema = 'public'
  and table_name = 'rooms'
  and constraint_name in (
    'rooms_width_m_non_negative',
    'rooms_length_m_non_negative',
    'rooms_height_m_non_negative',
    'rooms_window_count_non_negative',
    'rooms_door_count_non_negative',
    'rooms_balcony_count_non_negative'
  )
order by constraint_name;

select
  table_name,
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
from information_schema.columns
where table_schema = 'public'
  and table_name = 'room_openings'
  and column_name in (
    'home_id',
    'room_id',
    'opening_type',
    'label',
    'width_m',
    'height_m',
    'quantity',
    'deleted_at'
  )
order by column_name;

select
  table_name,
  constraint_name
from information_schema.table_constraints
where table_schema = 'public'
  and table_name = 'room_openings'
  and constraint_name in (
    'room_openings_type_check',
    'room_openings_width_non_negative',
    'room_openings_height_non_negative',
    'room_openings_quantity_positive'
  )
order by constraint_name;
