export type TradeResult = "Win" | "Lose";
export type TradeDirection = "Buy" | "Sell";

export type Trade = {
  id: string;
  user: string;
  initials: string;
  narrative: string;
  tradeDirection: TradeDirection;
  directionalBias: string;
  executeAt: Date | null;
  dateLabel: string;
  result: TradeResult;
  /** Combined debrief for list preview */
  reason: string;
  tradeReason: string | null;
  lostReason: string | null;
  winLoseAmount: number | null;
  imageUrls: Record<string, string>;
  images: number;
};

export type TraderUser = {
  id: string;
  name: string;
  /** When true (set in Supabase), trader can log new trades. */
  isEligible: boolean;
};

export function mapTraderUserRow(row: {
  id: string;
  name: string;
  is_eligible?: boolean | null;
  isEligible?: boolean | null;
}): TraderUser {
  const eligible = row.is_eligible ?? row.isEligible;
  return {
    id: row.id,
    name: row.name,
    isEligible: eligible === true,
  };
}

export function parseTradeDirection(
  value: string | null | undefined,
): TradeDirection {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "sell") return "Sell";
  if (normalized === "buy") return "Buy";
  return "Buy";
}

export type TradeRow = {
  id: string;
  user_name: string | null;
  bias: string | null;
  trade_direction?: string | null;
  tradeDirection?: string | null;
  narrative: string | null;
  execute_at: string | null;
  result: string | null;
  reason: string | null;
  lost_reason: string | null;
  win_lose_amount: number | null;
  image_urls: unknown;
  created_at: string;
};

export function mapTradeRow(data: TradeRow): Trade {
  const user = String(data.user_name || "Unknown trader");
  const imageUrls =
    data.image_urls && typeof data.image_urls === "object"
      ? (data.image_urls as Record<string, string>)
      : {};
  const executeAt = data.execute_at ? new Date(data.execute_at) : null;
  const result: TradeResult = data.result === "Lose" ? "Lose" : "Win";
  const tradeReason = data.reason ?? null;
  const lostReason = data.lost_reason ?? null;
  const winLoseAmount =
    data.win_lose_amount === null || data.win_lose_amount === undefined
      ? null
      : Number(data.win_lose_amount);

  return {
    id: data.id,
    user,
    initials: user
      .split(" ")
      .map((name) => name[0])
      .join(""),
    narrative: String(data.narrative || "No narrative recorded"),
    tradeDirection: parseTradeDirection(
      data.trade_direction ?? data.tradeDirection,
    ),
    directionalBias: String(data.bias || "Neutral"),
    executeAt,
    dateLabel: executeAt
      ? executeAt.toLocaleString()
      : data.created_at
        ? new Date(data.created_at).toLocaleString()
        : "Date not set",
    result,
    tradeReason,
    lostReason,
    winLoseAmount:
      winLoseAmount !== null && Number.isFinite(winLoseAmount)
        ? winLoseAmount
        : null,
    reason: String(
      result === "Lose"
        ? lostReason || tradeReason || "No loss reason added."
        : tradeReason || "No reason added.",
    ),
    imageUrls,
    images: Object.keys(imageUrls).length,
  };
}
