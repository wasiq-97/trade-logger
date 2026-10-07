"use client";

import { useMemo, useRef } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/15 [color-scheme:light]";

function splitExecuteAt(value: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

function mergeExecuteAt(date: string, time: string): string {
  if (!date) return "";
  return `${date}T${time || "00:00"}`;
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  input.focus();
  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
    } catch {
      /* showPicker throws if not triggered by user gesture in some browsers */
    }
  }
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ExecuteDateTimeField({ value, onChange, className }: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const { date, time } = useMemo(() => splitExecuteAt(value), [value]);

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            ref={dateRef}
            type="date"
            value={date}
            onChange={(e) => onChange(mergeExecuteAt(e.target.value, time))}
            className={cn(fieldClass, "pr-10")}
            aria-label="Execution date"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Open date calendar"
            onClick={() => openPicker(dateRef.current)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--teal-dark)]"
          >
            <CalendarDays className="size-4" />
          </button>
        </div>
        <div className="relative w-[132px] shrink-0 sm:w-[140px]">
          <input
            ref={timeRef}
            type="time"
            value={time}
            onChange={(e) =>
              onChange(date ? mergeExecuteAt(date, e.target.value) : "")
            }
            disabled={!date}
            className={cn(
              fieldClass,
              "pr-9",
              !date && "cursor-not-allowed opacity-50",
            )}
            aria-label="Execution time"
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={!date}
            aria-label="Open time picker"
            onClick={() => openPicker(timeRef.current)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--teal-dark)] disabled:pointer-events-none disabled:opacity-40"
          >
            <Clock3 className="size-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-[var(--muted)]">
        Pick a date first, then time. Uses your browser calendar (dd/mm/yyyy
        where supported).
      </p>
    </div>
  );
}
