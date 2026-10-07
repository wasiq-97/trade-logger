"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { TradeDetailView } from "@/components/trade-detail-view";
import type { Trade } from "@/lib/trades/types";
import { formatWinLoseAmount } from "@/lib/trades/format-money";
import { cn } from "@/lib/utils";

type Props = {
  trades: Trade[];
  loading: boolean;
  traderLabel: string;
};

export function TradesView({ trades, loading, traderLabel }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const filtered = useMemo(() => {
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
        formatWinLoseAmount(trade.winLoseAmount)
          .toLowerCase()
          .includes(q),
    );
  }, [trades, query]);

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
            {traderLabel} · {trades.length} entr
            {trades.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--muted)] sm:w-72">
          <Search className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trades…"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--muted)]"
          />
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] py-16 text-center text-sm text-[var(--muted)]">
          Loading trades…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line-strong)] py-12 text-center text-xs text-[var(--muted)]">
          {trades.length === 0
            ? "No trades logged yet. Use Log trade to add your first entry."
            : "No trades match your search."}
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
