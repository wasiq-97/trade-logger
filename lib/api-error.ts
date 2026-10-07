import toast from "react-hot-toast";

type ApiErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function formatApiError(context: string, error?: ApiErrorLike | null) {
  const parts = [context];
  if (error?.message) parts.push(error.message);
  if (error?.details) parts.push(error.details);
  if (error?.hint) parts.push(`Hint: ${error.hint}`);
  return parts.filter(Boolean).join("\n\n");
}

export function alertApiError(context: string, error?: ApiErrorLike | null) {
  toast.error(formatApiError(context, error));
}

export function alertMessage(message: string) {
  toast(message);
}

export function alertSuccess(message: string) {
  toast.success(message);
}

export function alertStorageUploadError(
  context: string,
  error: ApiErrorLike | null | undefined,
  setupHint: string,
) {
  const message = error?.message?.toLowerCase() ?? "";
  if (message.includes("bucket not found")) {
    toast.error(
      `${context}\n\nBucket not found — the Storage bucket does not exist in this Supabase project yet.\n\n${setupHint}`,
    );
    return;
  }
  alertApiError(context, error);
}
