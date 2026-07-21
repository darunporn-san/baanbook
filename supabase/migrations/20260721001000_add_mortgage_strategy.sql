alter table public.mortgage_yearly_terms
  add column if not exists strategy text;

alter table public.mortgage_yearly_terms
  drop constraint if exists mortgage_yearly_terms_strategy_check,
  add constraint mortgage_yearly_terms_strategy_check
    check (strategy is null or strategy in ('refinance', 'retention'));
