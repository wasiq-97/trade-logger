"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import type { Trade } from "@/lib/trades/types";
import { formatWinLoseAmount } from "@/lib/trades/format-money";
import { cn } from "@/lib/utils";

const IMAGE_LABELS: Record<string, string> = {
  narrative4h: "Narrative · 4h",
  narrative1h: "Narrative · 1h",
  executionLtf: "Execution · LTF",
};

type Props = {
  trade: Trade;
  onBack: () => void;
};

export function TradeDetailView({ trade, onBack }: Props) {
  const amountLabel = formatWinLoseAmount(trade.winLoseAmount);
  const imageEntries = Object.entries(trade.imageUrls ?? {});

  return (
    <div className="mx-auto max-w-[720px]">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--teal-dark)] hover:bg-[var(--teal-soft)]"
      >
        <ArrowLeft className="size-4" />
        Back to all trades
      </button>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="border-b border-[var(--line)] px-5 py-5 sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--teal-dark)]">
            Trade details
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em]">
            {trade.user}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{trade.dateLabel}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              className={
                trade.result === "Win"
                  ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                  : "bg-[var(--rose-soft)] text-[var(--rose)]"
              }
            >
              {trade.result}
            </Badge>
            <Badge
              className={
                trade.tradeDirection === "Buy"
                  ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                  : "bg-[var(--rose-soft)] text-[var(--rose)]"
              }
            >
              {trade.tradeDirection}
            </Badge>
            <Badge>{trade.directionalBias}</Badge>
          </div>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7">
          <DetailRow label="Trade direction">
            <p className="text-sm font-semibold">{trade.tradeDirection}</p>
          </DetailRow>

          <DetailRow label="Win / lose amount">
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                trade.winLoseAmount === null && "text-[var(--muted)]",
                trade.winLoseAmount !== null &&
                  trade.winLoseAmount >= 0 &&
                  "text-[var(--teal-dark)]",
                trade.winLoseAmount !== null &&
                  trade.winLoseAmount < 0 &&
                  "text-[var(--rose)]",
              )}
            >
              {amountLabel}
            </span>
          </DetailRow>

          <DetailRow label="Market narrative">
            <p className="text-sm leading-relaxed">{trade.narrative}</p>
          </DetailRow>

          <DetailRow label="Reason for trade">
            <p className="text-sm leading-relaxed">
              {trade.tradeReason || "—"}
            </p>
          </DetailRow>

          {trade.result === "Lose" && (
            <DetailRow label="Probable reason for loss">
              <p className="text-sm leading-relaxed">
                {trade.lostReason || "—"}
              </p>
            </DetailRow>
          )}

          {imageEntries.length > 0 ? (
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Chart screenshots
              </p>
              <ul className="space-y-4">
                {imageEntries.map(([key, url]) => (
                  <li key={key}>
                    <p className="mb-2 text-xs font-semibold">
                      {IMAGE_LABELS[key] ?? key}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-xl border border-[var(--line)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={IMAGE_LABELS[key] ?? key}
                        className="max-h-64 w-full object-cover object-top"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <DetailRow label="Chart screenshots">
              <p className="text-sm text-[var(--muted)]">No images attached.</p>
            </DetailRow>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold text-[var(--ink)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
