"use client";

import {
  Filter,
  LayoutDashboard,
  ListOrdered,
  Plus,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "dashboard" | "trades" | "log";

const navItems: { id: AppTab; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trades", label: "Trades", icon: ListOrdered },
    { id: "log", label: "Log trade", icon: Plus },
  ];

type Props = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  tradeCount: number;
  winRate: number;
  selectedUser: string;
  onSelectedUserChange: (user: string) => void;
  traderOptions: string[];
  newUserName: string;
  onNewUserNameChange: (name: string) => void;
  showCreateUser: boolean;
  onToggleCreateUser: () => void;
  onCreateUser: () => void;
};

export function AppSidebar({
  activeTab,
  onTabChange,
  tradeCount,
  winRate,
  selectedUser,
  onSelectedUserChange,
  traderOptions,
  newUserName,
  onNewUserNameChange,
  showCreateUser,
  onToggleCreateUser,
  onCreateUser,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Workspace
      </div>
      <nav className="flex flex-col gap-1 text-[13px] font-semibold">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              activeTab === id
                ? "bg-[var(--teal-soft)] text-[var(--teal-dark)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]",
            )}
          >
            <Icon className="size-[17px]" />
            {label}
            {id === "trades" && tradeCount > 0 && (
              <span className="ml-auto rounded-md bg-white/70 px-2 py-0.5 text-[10px]">
                {tradeCount}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-10 mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Filters
      </div>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold">
          <Filter className="size-3.5 text-[var(--teal)]" /> View by trader
        </div>
        <select
          value={selectedUser}
          onChange={(e) => onSelectedUserChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2 text-xs font-medium outline-none"
        >
          <option>All traders</option>
          {traderOptions.map((user) => (
            <option key={user}>{user}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onToggleCreateUser}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--teal-dark)] hover:bg-[var(--teal-soft)]"
        >
          <Plus className="size-3.5" /> Create user
        </button>
        {showCreateUser && (
          <div className="mt-3 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-3">
            <label
              className="block text-[11px] font-bold text-[var(--ink)]"
              htmlFor="new-user"
            >
              User name
            </label>
            <input
              id="new-user"
              value={newUserName}
              onChange={(e) => onNewUserNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                )
                  onCreateUser();
              }}
              placeholder="e.g. Alex Morgan"
              className="mt-2 h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2 text-xs outline-none focus:border-[var(--teal)]"
              autoFocus
            />
            <button
              type="button"
              onClick={onCreateUser}
              disabled={!newUserName.trim()}
              className="mt-2 w-full rounded-lg bg-[var(--navy)] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save user
            </button>
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
              New users start as not eligible. Turn on{" "}
              <span className="font-semibold">is_eligible</span> in Supabase to
              allow logging trades.
            </p>
          </div>
        )}
      </div>
      <div className="mt-auto rounded-2xl bg-[var(--navy)] p-4 text-white">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-white/60">
          <TrendingUp className="size-3.5" /> Win rate
        </div>
        <div className="text-2xl font-bold">
          {tradeCount === 0 ? "—" : `${winRate}%`}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[var(--teal)] transition-all"
            style={{ width: `${Math.min(winRate, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] text-white/50">
          {tradeCount === 0
            ? "Log trades to see stats"
            : `Based on ${tradeCount} filtered trade${tradeCount === 1 ? "" : "s"}`}
        </div>
      </div>
    </div>
  );
}
