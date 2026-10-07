"use client";

import { useState } from "react";
import { Check, FileImage, Save } from "lucide-react";
import { ExecuteDateTimeField } from "@/components/execute-datetime-field";
import { FileField } from "@/components/file-field";
import {
  alertApiError,
  alertMessage,
  alertStorageUploadError,
} from "@/lib/api-error";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  storageBucketSetupHint,
  TRADE_IMAGES_BUCKET,
} from "@/lib/storage-config";
import {
  normalizeWinLoseAmount,
  parseWinLoseAmountInput,
} from "@/lib/trades/format-money";
import type { TraderUser } from "@/lib/trades/types";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/15";

const emptyForm = {
  user: "",
  bias: "Bullish",
  narrative: "",
  executeAt: "",
  result: "Win" as const,
  reason: "",
  lostReason: "",
  winLoseAmount: "",
  tradeDirection: "Buy" as const,
};

type Props = {
  eligibleTraderNames: string[];
  eligibleTraderUsers: TraderUser[];
  onSaved?: () => void;
};

export function LogTradeView({
  eligibleTraderNames,
  eligibleTraderUsers,
  onSaved,
}: Props) {
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fileFieldsKey, setFileFieldsKey] = useState(0);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function saveTrade() {
    setSaving(true);
    setSaved(false);
    try {
      if (!supabase || !isSupabaseConfigured) {
        alertMessage(
          "Supabase is not configured. Add your keys to .env and restart the dev server.",
        );
        return;
      }
      if (!form.user) {
        alertMessage("Select a trader before saving.");
        return;
      }
      const imageUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;
        const path = `trades/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage
          .from(TRADE_IMAGES_BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) {
          alertStorageUploadError(
            `Could not upload chart (${key})`,
            uploadError,
            storageBucketSetupHint(),
          );
          return;
        }
        const { data } = supabase.storage
          .from(TRADE_IMAGES_BUCKET)
          .getPublicUrl(path);
        imageUrls[key] = data.publicUrl;
      }
      const selectedTrader = eligibleTraderUsers.find(
        (user) => user.name === form.user,
      );
      if (!selectedTrader) {
        alertMessage(
          "Selected trader was not found or is not eligible to log trades. Set is_eligible to true in Supabase (trader_users).",
        );
        return;
      }
      const parsedAmount = parseWinLoseAmountInput(form.winLoseAmount);
      const winLoseAmount = normalizeWinLoseAmount(
        parsedAmount,
        form.result === "Lose" ? "Lose" : "Win",
      );

      const { error } = await supabase.from("trades").insert({
        user_id: selectedTrader.id,
        user_name: selectedTrader.name,
        bias: form.bias,
        trade_direction: form.tradeDirection,
        narrative: form.narrative,
        execute_at: form.executeAt || null,
        result: form.result,
        reason: form.reason,
        lost_reason: form.result === "Lose" ? form.lostReason : null,
        win_lose_amount: winLoseAmount,
        image_urls: imageUrls,
      });
      if (error) {
        alertApiError("Could not save trade", error);
        return;
      }
      setSaved(true);
      setForm(emptyForm);
      setFiles({});
      setFileFieldsKey((k) => k + 1);
      onSaved?.();
      setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      alertApiError(
        "Could not save trade",
        err instanceof Error ? err : { message: String(err) },
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-8">
        <h1 className="text-[30px] font-bold tracking-[-0.04em] sm:text-[34px]">
          Log a trade
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Capture context, charts, and outcome before the setup fades.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--teal-dark)]">
              New entry
            </div>
            <h2 className="text-xl font-bold tracking-[-0.03em]">
              Document your trade
            </h2>
          </div>
          <div className="rounded-lg bg-[var(--surface-2)] p-2 text-[var(--muted)]">
            <FileImage className="size-4" />
          </div>
        </div>

        {eligibleTraderNames.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--ink)]">
              No eligible traders yet
            </p>
            <p className="mt-2">
              Create a user in the sidebar, then set{" "}
              <code className="rounded bg-[var(--surface-2)] px-1 text-xs">
                is_eligible
              </code>{" "}
              to <strong>true</strong> for that row in Supabase →{" "}
              <strong>trader_users</strong>. Only then can they log trades here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[13px] font-semibold">
                Trader
                <select
                  value={form.user}
                  onChange={(e) => update("user", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select trader</option>
                  {eligibleTraderNames.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </label>
              <div className="text-[13px] font-semibold">
                Time to execute
                <ExecuteDateTimeField
                  value={form.executeAt}
                  onChange={(executeAt) => update("executeAt", executeAt)}
                />
              </div>
            </div>
            <label className="text-[13px] font-semibold">
              Market narrative{" "}
              <span className="font-normal text-[var(--muted)]">
                (daily / weekly)
              </span>
              <input
                value={form.narrative}
                onChange={(e) => update("narrative", e.target.value)}
                placeholder="e.g. Bullish — continuation above weekly open"
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[13px] font-semibold">
                Trade direction
                <select
                  value={form.tradeDirection}
                  onChange={(e) => update("tradeDirection", e.target.value)}
                  className={inputClass}
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </label>
              <label className="text-[13px] font-semibold">
                Directional bias
                <select
                  value={form.bias}
                  onChange={(e) => update("bias", e.target.value)}
                  className={inputClass}
                >
                  <option>Bullish</option>
                  <option>Bearish</option>
                  <option>Neutral</option>
                </select>
              </label>
              <label className="text-[13px] font-semibold">
                Result
                <select
                  value={form.result}
                  onChange={(e) => update("result", e.target.value)}
                  className={inputClass}
                >
                  <option>Win</option>
                  <option>Lose</option>
                </select>
              </label>
              <label className="text-[13px] font-semibold sm:col-span-2">
                Win / lose amount{" "}
                <span className="font-normal text-[var(--muted)]">
                  (USD, saved as a number)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.winLoseAmount}
                  onChange={(e) => update("winLoseAmount", e.target.value)}
                  placeholder="e.g. 250.50"
                  className={inputClass}
                />
              </label>
            </div>
            {form.result === "Lose" && (
              <label className="text-[13px] font-semibold">
                Probable reason for loss
                <input
                  value={form.lostReason}
                  onChange={(e) => update("lostReason", e.target.value)}
                  placeholder="What caused the loss?"
                  className={inputClass}
                />
              </label>
            )}
            <label className="text-[13px] font-semibold">
              Reason for trade{" "}
              <span className="font-normal text-[var(--muted)]">
                (setup & debrief)
              </span>
              <textarea
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                placeholder="Why you took the trade and what you learned…"
                className="mt-2 min-h-[82px] w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/15"
              />
            </label>
            <div key={fileFieldsKey} className="grid gap-3">
              <FileField
                label="Narrative · 4h"
                helper="Upload 4h chart"
                onChange={(file) =>
                  setFiles((current) => ({ ...current, narrative4h: file }))
                }
              />
              <FileField
                label="Narrative · 1h"
                helper="Upload 1h chart"
                onChange={(file) =>
                  setFiles((current) => ({ ...current, narrative1h: file }))
                }
              />
              <FileField
                label="Execution · LTF"
                helper="Upload entry chart"
                onChange={(file) =>
                  setFiles((current) => ({ ...current, executionLtf: file }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
              <span className="text-[11px] text-[var(--muted)]">
                {isSupabaseConfigured
                  ? "Images upload to Supabase Storage."
                  : "Add Supabase keys in .env to enable sync."}
              </span>
              <button
                type="button"
                onClick={saveTrade}
                disabled={saving || !form.user}
                className="flex items-center gap-2 rounded-xl bg-[var(--teal)] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[var(--teal-dark)] disabled:opacity-60"
              >
                {saved ? <Check className="size-4" /> : <Save className="size-4" />}
                {saving ? "Saving…" : saved ? "Trade saved" : "Save this trade"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
