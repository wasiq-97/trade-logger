export function formatWinLoseAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Parse form input; returns null if empty. */
export function parseWinLoseAmountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** Store signed float: wins positive, losses negative. */
export function normalizeWinLoseAmount(
  amount: number | null,
  result: "Win" | "Lose",
): number | null {
  if (amount === null) return null;
  const abs = Math.abs(amount);
  return result === "Lose" ? -abs : abs;
}
