/** Must match a bucket in Supabase Dashboard → Storage (default: trade-images). */
export const TRADE_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "trade-images";

export function storageBucketSetupHint(): string {
  return `Create a public Storage bucket named "${TRADE_IMAGES_BUCKET}" in Supabase (Dashboard → Storage → New bucket), or run supabase/storage-setup.sql in the SQL editor.`;
}
