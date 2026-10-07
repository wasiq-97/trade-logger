type ApiErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

export function alertApiError(context: string, error?: ApiErrorLike | null) {
  const parts = [context];
  if (error?.message) parts.push(error.message);
  if (error?.details) parts.push(error.details);
  if (error?.hint) parts.push(`Hint: ${error.hint}`);
  window.alert(parts.filter(Boolean).join("\n\n"));
}

export function alertMessage(message: string) {
  window.alert(message);
}

export function alertStorageUploadError(
  context: string,
  error: ApiErrorLike | null | undefined,
  setupHint: string,
) {
  const message = error?.message?.toLowerCase() ?? "";
  if (message.includes("bucket not found")) {
    window.alert(
      `${context}\n\nBucket not found — the Storage bucket does not exist in this Supabase project yet.\n\n${setupHint}`,
    );
    return;
  }
  alertApiError(context, error);
}
