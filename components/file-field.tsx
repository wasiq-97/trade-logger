"use client";

import { useState } from "react";
import { Check, CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileField({
  label,
  helper,
  onChange,
}: {
  label: string;
  helper: string;
  onChange: (file: File | undefined) => void;
}) {
  const [fileName, setFileName] = useState("");
  return (
    <label className="group block cursor-pointer">
      <span className="flex items-center justify-between text-[13px] font-semibold text-[var(--ink)]">
        <span>{label}</span>
        <span className="text-[11px] font-medium text-[var(--muted)]">
          PNG, JPG
        </span>
      </span>
      <span
        className={cn(
          "mt-2 flex min-h-[92px] items-center gap-3 rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-4 transition group-hover:border-[var(--teal)] group-hover:bg-[var(--teal-soft)]",
          fileName && "border-[var(--teal)] bg-[var(--teal-soft)]",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--teal)] shadow-sm">
          {fileName ? (
            <Check className="size-4" />
          ) : (
            <CloudUpload className="size-4" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-[var(--ink)]">
            {fileName || helper}
          </span>
          <span className="mt-1 block text-[11px] text-[var(--muted)]">
            {fileName ? "Ready to upload" : "Drop your chart screenshot here"}
          </span>
        </span>
      </span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFileName(file?.name || "");
          onChange(file);
        }}
      />
    </label>
  );
}
