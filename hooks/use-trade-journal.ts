"use client";

import { useEffect, useMemo, useState } from "react";
import { alertApiError } from "@/lib/api-error";
import { supabase } from "@/lib/supabase/client";
import {
  mapTradeRow,
  mapTraderUserRow,
  type Trade,
  type TraderUser,
} from "@/lib/trades/types";

export function useTradeJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [traderUsers, setTraderUsers] = useState<TraderUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    async function loadData(options?: { silent?: boolean }) {
      setLoading(true);
      const [tradesRes, usersRes] = await Promise.all([
        supabase!
          .from("trades")
          .select(
            "id, user_name, bias, trade_direction, narrative, execute_at, result, reason, lost_reason, win_lose_amount, image_urls, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase!
          .from("trader_users")
          .select("id, name, is_eligible")
          .order("name"),
      ]);
      if (!active) return;
      const loadError = tradesRes.error ?? usersRes.error;
      if (loadError && !options?.silent) {
        alertApiError("Could not load journal data", loadError);
      }
      const tradeRows = tradesRes.data;
      const userRows = usersRes.data;
      setTraderUsers((userRows ?? []).map((row) => mapTraderUserRow(row)));
      setTrades((tradeRows ?? []).map((row) => mapTradeRow(row)));
      setLoading(false);
    }

    void loadData();
    const channel = supabase
      .channel("trade-journal-refresh")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => void loadData({ silent: true }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trader_users" },
        () => void loadData({ silent: true }),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase!.removeChannel(channel);
    };
  }, []);

  const traderNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...traderUsers.map((u) => u.name),
          ...trades.map((t) => t.user),
        ]),
      ).sort((a, b) => a.localeCompare(b)),
    [traderUsers, trades],
  );

  const eligibleTraderUsers = useMemo(
    () => traderUsers.filter((u) => u.isEligible),
    [traderUsers],
  );

  const eligibleTraderNames = useMemo(
    () => eligibleTraderUsers.map((u) => u.name).sort((a, b) => a.localeCompare(b)),
    [eligibleTraderUsers],
  );

  return {
    trades,
    traderUsers,
    traderNames,
    eligibleTraderUsers,
    eligibleTraderNames,
    loading,
  };
}
