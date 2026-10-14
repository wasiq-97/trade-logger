import type { Trade } from "./types";

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Match trades executed on this calendar day (local time). Empty date = no filter. */
export function tradeMatchesExecutionDate(
  trade: Trade,
  date: string,
): boolean {
  if (!date) return true;
  if (!trade.executeAt) return false;
  return toLocalDateKey(trade.executeAt) === date;
}
