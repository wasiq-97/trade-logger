-- Run in Supabase Dashboard → SQL Editor (same project as NEXT_PUBLIC_SUPABASE_URL).
-- Creates the chart image bucket the app uploads to.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trade-images',
  'trade-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (required for getPublicUrl links in the journal)
create policy "Trade images public read"
on storage.objects for select
to public
using (bucket_id = 'trade-images');

-- Allow uploads with the anon/publishable key used by the browser client
create policy "Trade images anon upload"
on storage.objects for insert
to anon
with check (bucket_id = 'trade-images');

create policy "Trade images anon update"
on storage.objects for update
to anon
using (bucket_id = 'trade-images')
with check (bucket_id = 'trade-images');
