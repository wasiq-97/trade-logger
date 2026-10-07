-- Run in Supabase SQL Editor if trades already exists without trade_direction.

alter table public.trades
add column if not exists trade_direction text not null default 'Buy';

comment on column public.trades.trade_direction is 'Buy or Sell';

alter table public.trades
drop constraint if exists trades_trade_direction_check;

alter table public.trades
add constraint trades_trade_direction_check
check (trade_direction in ('Buy', 'Sell'));
