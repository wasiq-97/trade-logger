"use client";

import { useMemo, useState } from "react";
import { BarChart3, Menu } from "lucide-react";
import {
  AppSidebar,
  type AppTab,
} from "@/components/app-sidebar";
import { DashboardView } from "@/components/dashboard-view";
import { LogTradeView } from "@/components/log-trade-view";
import { TradesView } from "@/components/trades-view";
import { useTradeJournal } from "@/hooks/use-trade-journal";
import { computeTradeAnalytics } from "@/lib/trades/analytics";
import { alertApiError, alertMessage } from "@/lib/api-error";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function Page() {
  const {
    trades,
    traderNames,
    eligibleTraderUsers,
    eligibleTraderNames,
    loading,
  } = useTradeJournal();
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("All traders");
  const [newUserName, setNewUserName] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);

  const visibleTrades = useMemo(
    () =>
      selectedUser === "All traders"
        ? trades
        : trades.filter((trade) => trade.user === selectedUser),
    [selectedUser, trades],
  );

  const analytics = useMemo(
    () => computeTradeAnalytics(visibleTrades),
    [visibleTrades],
  );

  const traderLabel =
    selectedUser === "All traders" ? "All traders" : selectedUser;

  async function createUser() {
    const name = newUserName.trim();
    if (!name) {
      alertMessage("Enter a name for the new trader.");
      return;
    }
    if (!supabase) {
      alertMessage(
        "Supabase is not configured. Add your keys to .env and restart the dev server.",
      );
      return;
    }
    const { error } = await supabase
      .from("trader_users")
      .insert({ name, is_eligible: false });
    if (error) {
      alertApiError("Could not create trader", error);
      return;
    }
    setNewUserName("");
    setShowCreateUser(false);
    alertMessage(
      `Trader "${name}" created. Set is_eligible to true in Supabase (trader_users) before they can log trades.`,
    );
  }

  function navigate(tab: AppTab) {
    setActiveTab(tab);
    setMobileOpen(false);
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--navy)] text-white">
              <BarChart3 className="size-[18px]" />
            </div>
            <span className="text-[15px] font-bold tracking-[-0.02em]">
              Trade<span className="text-[var(--teal)]">log</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside
          className={cn(
            "fixed inset-y-[73px] left-0 z-[15] w-[232px] h-[calc(100vh-73px)] overflow-y-auto border-r border-[var(--line)] bg-[var(--surface)] p-5 shadow-[8px_0_24px_rgba(15,35,49,0.12)] transition-transform lg:sticky lg:top-[73px] lg:z-10 lg:block lg:h-[calc(100vh-73px)] lg:bg-[var(--canvas)] lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AppSidebar
            activeTab={activeTab}
            onTabChange={navigate}
            tradeCount={visibleTrades.length}
            winRate={analytics.winRate}
            selectedUser={selectedUser}
            onSelectedUserChange={setSelectedUser}
            traderOptions={traderNames}
            newUserName={newUserName}
            onNewUserNameChange={setNewUserName}
            showCreateUser={showCreateUser}
            onToggleCreateUser={() => setShowCreateUser((c) => !c)}
            onCreateUser={createUser}
          />
        </aside>

        <section className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10">
          {activeTab === "dashboard" && (
            <DashboardView
              analytics={analytics}
              loading={loading}
              traderLabel={traderLabel}
            />
          )}
          {activeTab === "trades" && (
            <TradesView
              trades={visibleTrades}
              loading={loading}
              traderLabel={traderLabel}
            />
          )}
          {activeTab === "log" && (
            <LogTradeView
              eligibleTraderNames={eligibleTraderNames}
              eligibleTraderUsers={eligibleTraderUsers}
              onSaved={() => setActiveTab("trades")}
            />
          )}
        </section>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[5] bg-slate-950/10 lg:hidden"
        />
      )}
    </main>
  );
}
