# Trade Journal

A Next.js trade journal for recording daily trading decisions, attaching chart screenshots, filtering trades by user, and reviewing outcomes.

## Requirements

- Node.js 20 or newer
- pnpm 12 or newer
- A connected Supabase project
- Supabase Storage and the trade journal tables configured

## Supabase setup

The app now uses Supabase for both trade data and chart image storage. The required Supabase environment variables are provisioned by the connected Vercel integration and are loaded automatically for development and deployment.

Before running the app, make sure the Supabase project has:

- A `trader_users` table for journal users with `is_eligible` (boolean, default `false`) — only eligible users appear on **Log trade** (run [`supabase/add-trader-is-eligible.sql`](supabase/add-trader-is-eligible.sql) if needed)
- A `trades` table for saved journal entries (include `win_lose_amount` as `double precision` — run [`supabase/add-win-lose-amount.sql`](supabase/add-win-lose-amount.sql) if upgrading an existing table; include `trade_direction` `Buy`/`Sell` — [`supabase/add-trade-direction.sql`](supabase/add-trade-direction.sql))
- RLS policies allowing the intended users to read and create records
- A **public** Storage bucket named **`trade-images`** (chart uploads). Quick setup: run [`supabase/storage-setup.sql`](supabase/storage-setup.sql) in the Supabase SQL editor, or create the bucket manually under **Storage → New bucket** (name must be exactly `trade-images`, enable **Public bucket**). Optional: set `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` if you use a different bucket id.

Do not add Firebase configuration or Firebase Admin credentials. The old Firebase setup has been removed from the application.

## Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production check

```bash
pnpm build
pnpm start
```

## App behavior

- Create users from the sidebar before recording a trade.
- Select a user to filter the journal to that user's trades.
- Complete the trade form and upload the 4-hour, 1-hour, and LTF narrative images.
- Choose **Win** or **Lose**. Selecting **Lose** reveals the required probable reason for loss field.
- Save the trade to upload images to Supabase Storage and save the trade record in Postgres.
- If you see **Bucket not found**, the `trade-images` bucket has not been created in your Supabase project yet (see Supabase setup above).

## Suggested production rules

Add Supabase Auth and tighten RLS on `trades`, `trader_users`, and Storage before deploying publicly.
