"use client";

import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { TradeAnalytics } from "@/lib/trades/analytics";
import { cn } from "@/lib/utils";

type Props = {
  analytics: TradeAnalytics;
  loading: boolean;
  traderLabel: string;
};

export function DashboardView({ analytics, loading, traderLabel }: Props) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weekDelta = analytics.weekOverWeekDelta;
  const deltaLabel =
    weekDelta === 0
      ? "Same as last week"
      : `${weekDelta > 0 ? "+" : ""}${weekDelta} vs last week`;

  return (
    <div className="mx-auto max-w-[1110px]">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--teal-dark)]">
          <span className="size-1.5 rounded-full bg-[var(--teal)]" /> {today}
        </div>
        <h1 className="text-[30px] font-bold tracking-[-0.04em] sm:text-[36px]">
          Trading analytics
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Live stats for{" "}
          <span className="font-semibold text-[var(--ink)]">{traderLabel}</span>
          , calculated from your journal entries.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] py-16 text-center text-sm text-[var(--muted)]">
          Loading trades…
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Trades this week"
              value={String(analytics.tradesThisWeek)}
              hint={deltaLabel}
              hintPositive={weekDelta >= 0}
            />
            <StatCard
              label="Win rate"
              value={
                analytics.totalTrades === 0
                  ? "—"
                  : `${analytics.winRate}%`
              }
              icon={
                analytics.winRate >= 50 ? (
                  <TrendingUp className="size-5 text-[var(--teal)]" />
                ) : analytics.totalTrades > 0 ? (
                  <TrendingDown className="size-5 text-[var(--rose)]" />
                ) : null
              }
            />
            <StatCard
              label="Wins / losses"
              value={`${analytics.wins} / ${analytics.losses}`}
              hint={`${analytics.totalTrades} total`}
            />
            <StatCard
              label="Current streak"
              value={analytics.streakLabel}
              hint={
                analytics.totalTrades === 0
                  ? "No data yet"
                  : "Most recent runs"
              }
              hintAccent
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-bold">This week vs last</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Counted by execution time when set, otherwise excluded from
                weekly totals.
              </p>
              <div className="mt-5 flex items-end gap-6">
                <div>
                  <div className="text-[11px] font-semibold text-[var(--muted)]">
                    This week
                  </div>
                  <div className="text-3xl font-bold">
                    {analytics.tradesThisWeek}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[var(--muted)]">
                    Last week
                  </div>
                  <div className="text-3xl font-bold text-[var(--muted)]">
                    {analytics.tradesLastWeek}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-bold">Performance snapshot</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                All metrics update when you save trades in Supabase.
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex justify-between border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--muted)]">Win rate</span>
                  <span className="font-bold">
                    {analytics.totalTrades === 0
                      ? "—"
                      : `${analytics.winRate}%`}
                  </span>
                </li>
                <li className="flex justify-between border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--muted)]">Winning trades</span>
                  <span className="font-bold text-[var(--teal-dark)]">
                    {analytics.wins}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--muted)]">Losing trades</span>
                  <span className="font-bold text-[var(--rose)]">
                    {analytics.losses}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  hintPositive,
  hintAccent,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  hintPositive?: boolean;
  hintAccent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="text-[11px] font-semibold text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {icon ??
          (hint && (
            <span
              className={cn(
                "text-xs font-bold",
                hintAccent && "text-[var(--amber)]",
                hintPositive === true && "text-[var(--teal-dark)]",
                hintPositive === false && "text-[var(--rose)]",
                hintPositive === undefined &&
                  !hintAccent &&
                  "font-medium text-[var(--muted)]",
              )}
            >
              {hint}
            </span>
          ))}
      </div>
    </div>
  );
}
