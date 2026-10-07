-- Run in Supabase SQL Editor. New traders default to not eligible until you set true in the table editor.

alter table public.trader_users
add column if not exists is_eligible boolean not null default false;

comment on column public.trader_users.is_eligible is
  'When true, the trader can log trades in the journal app.';
