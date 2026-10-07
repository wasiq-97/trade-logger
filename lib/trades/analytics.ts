import type { Trade } from "./types";

export type TradeAnalytics = {
  tradesThisWeek: number;
  tradesLastWeek: number;
  weekOverWeekDelta: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  streakLabel: string;
  streakCount: number;
};

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function tradeTimestamp(trade: Trade): number | null {
  const t = trade.executeAt?.getTime();
  return t ?? null;
}

function tradesBetween(trades: Trade[], start: Date, end: Date): Trade[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return trades.filter((trade) => {
    const ts = tradeTimestamp(trade);
    if (ts === null) return false;
    return ts >= startMs && ts < endMs;
  });
}

export function computeTradeAnalytics(trades: Trade[]): TradeAnalytics {
  const now = new Date();
  const thisWeekStart = startOfWeekMonday(now);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeek = tradesBetween(trades, thisWeekStart, thisWeekEnd);
  const lastWeek = tradesBetween(trades, lastWeekStart, thisWeekStart);

  const wins = trades.filter((t) => t.result === "Win").length;
  const losses = trades.filter((t) => t.result === "Lose").length;
  const totalTrades = trades.length;
  const winRate =
    totalTrades > 0 ? Math.round((wins / totalTrades) * 1000) / 10 : 0;

  const sorted = [...trades].sort((a, b) => {
    const aTs = tradeTimestamp(a) ?? 0;
    const bTs = tradeTimestamp(b) ?? 0;
    return bTs - aTs;
  });

  let streakLabel = "No trades yet";
  let streakCount = 0;
  if (sorted.length > 0) {
    const first = sorted[0]!.result;
    streakCount = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.result !== first) break;
      streakCount++;
    }
    streakLabel =
      first === "Win"
        ? `${streakCount} win${streakCount === 1 ? "" : "s"}`
        : `${streakCount} loss${streakCount === 1 ? "" : "es"}`;
  }

  return {
    tradesThisWeek: thisWeek.length,
    tradesLastWeek: lastWeek.length,
    weekOverWeekDelta: thisWeek.length - lastWeek.length,
    winRate,
    totalTrades,
    wins,
    losses,
    streakLabel,
    streakCount,
  };
}
