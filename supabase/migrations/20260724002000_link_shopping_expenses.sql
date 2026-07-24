alter table public.expenses
add column if not exists shopping_item_id uuid
references public.shopping_items(id) on delete set null;

create unique index if not exists expenses_shopping_item_idx
on public.expenses(shopping_item_id)
where shopping_item_id is not null and deleted_at is null;
