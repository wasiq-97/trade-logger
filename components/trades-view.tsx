"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { TradeDetailView } from "@/components/trade-detail-view";
import type { Trade } from "@/lib/trades/types";
import { formatWinLoseAmount } from "@/lib/trades/format-money";
import { tradeMatchesExecutionDate } from "@/lib/trades/execution-date-filter";
import { cn } from "@/lib/utils";

type ResultFilter = "all" | "Win" | "Lose";

type Props = {
  trades: Trade[];
  loading: boolean;
  traderLabel: string;
};

const resultFilters: { id: ResultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Win", label: "Wins" },
  { id: "Lose", label: "Losses" },
];

function applyResultFilter(trades: Trade[], resultFilter: ResultFilter) {
  if (resultFilter === "all") return trades;
  return trades.filter((trade) => trade.result === resultFilter);
}

function applySearchFilter(trades: Trade[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return trades;
  return trades.filter(
    (trade) =>
      trade.user.toLowerCase().includes(q) ||
      trade.narrative.toLowerCase().includes(q) ||
      trade.directionalBias.toLowerCase().includes(q) ||
      trade.tradeDirection.toLowerCase().includes(q) ||
      trade.reason.toLowerCase().includes(q) ||
      trade.result.toLowerCase().includes(q) ||
      formatWinLoseAmount(trade.winLoseAmount).toLowerCase().includes(q),
  );
}

export function TradesView({ trades, loading, traderLabel }: Props) {
  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [executeDate, setExecuteDate] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const byDate = useMemo(
    () =>
      trades.filter((trade) => tradeMatchesExecutionDate(trade, executeDate)),
    [trades, executeDate],
  );

  const byResult = useMemo(
    () => applyResultFilter(byDate, resultFilter),
    [byDate, resultFilter],
  );

  const filtered = useMemo(
    () => applySearchFilter(byResult, query),
    [byResult, query],
  );

  function emptyMessage(): string {
    if (trades.length === 0) {
      return "No trades logged yet. Use Log trade to add your first entry.";
    }
    if (byDate.length === 0 && executeDate) {
      return "No trades executed on this date.";
    }
    if (applyResultFilter(byDate, resultFilter).length === 0) {
      return `No ${resultFilter === "Win" ? "winning" : "losing"} trades in this view.`;
    }
    return "No trades match your current filters.";
  }

  if (selectedTrade) {
    return (
      <TradeDetailView
        trade={selectedTrade}
        onBack={() => setSelectedTrade(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.04em] sm:text-[34px]">
            All trades
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {traderLabel} · {filtered.length} shown
            {filtered.length !== trades.length && (
              <span> of {trades.length}</span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div
            className="flex rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"
            role="group"
            aria-label="Filter by result"
          >
            {resultFilters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setResultFilter(id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-bold transition",
                  resultFilter === id
                    ? id === "Win"
                      ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                      : id === "Lose"
                        ? "bg-[var(--rose-soft)] text-[var(--rose)]"
                        : "bg-[var(--navy)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              value={executeDate}
              onChange={(e) => setExecuteDate(e.target.value)}
              aria-label="Filter by execution date"
              className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--teal)] sm:w-[11.5rem] [color-scheme:light]"
            />
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--muted)] sm:w-56">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trades…"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--muted)]"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] py-16 text-center text-sm text-[var(--muted)]">
          Loading trades…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line-strong)] py-12 text-center text-xs text-[var(--muted)]">
          {emptyMessage()}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                  <th className="px-4 py-3">Trader</th>
                  <th className="px-4 py-3">Buy / sell</th>
                  <th className="px-4 py-3">Executed</th>
                  <th className="px-4 py-3">Bias</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Win / lose</th>
                  <th className="px-4 py-3">Narrative</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade) => (
                  <tr
                    key={trade.id}
                    className="group border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)]/60"
                  >
                    <td className="px-4 py-3 font-semibold">{trade.user}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex min-w-[52px] justify-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                          trade.tradeDirection === "Buy"
                            ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                            : "bg-[var(--rose-soft)] text-[var(--rose)]",
                        )}
                      >
                        {trade.tradeDirection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {trade.dateLabel}
                    </td>
                    <td className="px-4 py-3 text-xs">{trade.directionalBias}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold",
                          trade.result === "Win"
                            ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                            : "bg-[var(--rose-soft)] text-[var(--rose)]",
                        )}
                      >
                        {trade.result}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-bold tabular-nums",
                        trade.winLoseAmount === null && "text-[var(--muted)]",
                        trade.winLoseAmount !== null &&
                          trade.winLoseAmount >= 0 &&
                          "text-[var(--teal-dark)]",
                        trade.winLoseAmount !== null &&
                          trade.winLoseAmount < 0 &&
                          "text-[var(--rose)]",
                      )}
                    >
                      {formatWinLoseAmount(trade.winLoseAmount)}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs">
                      {trade.narrative}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTrade(trade)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--teal-dark)] hover:bg-[var(--teal-soft)]"
                      >
                        <Eye className="size-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
