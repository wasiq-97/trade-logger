-- Add P/L column to trades (run in Supabase SQL Editor if the table already exists).

alter table public.trades
add column if not exists win_lose_amount double precision;

comment on column public.trades.win_lose_amount is
  'Signed P/L in account currency units (e.g. 150.25 win, -75.5 loss).';
