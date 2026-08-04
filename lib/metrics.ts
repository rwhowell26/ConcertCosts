export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
};

export type ConcertCosts = Pick<
  Concert,
  | "ticket_cost"
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>;

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function totalCost(costs: ConcertCosts): number {
  return (
    toNumber(costs.ticket_cost) +
    toNumber(costs.ticket_fees) +
    toNumber(costs.parking_cost) +
    toNumber(costs.food_drink_cost) +
    toNumber(costs.merchandise_cost) +
    toNumber(costs.lodging_cost) +
    toNumber(costs.travel_cost) +
    toNumber(costs.other_cost)
  );
}

export function costPerHour(total: number, hours: number): number | null {
  const h = toNumber(hours);
  if (h <= 0) return null;
  return total / h;
}

/** Fun Points per $100 = (concert rating / total cost) * 100 */
export function funPointsPer100(funRating: number, total: number): number | null {
  if (total <= 0) return null;
  return (toNumber(funRating) / total) * 100;
}

export type ValueTier =
  | "poor"
  | "fair"
  | "good"
  | "great"
  | "amazing"
  | "unknown";

export type ValueScale = {
  /** 0–100 meter for the UI scale bar */
  meter: number;
  /** Fun points per $100 (null if cost is 0) */
  funPer100: number | null;
  tier: ValueTier;
  label: string;
  detail: string;
  /** daisyUI color class for badges / bars */
  colorClass: string;
  barClass: string;
};

/**
 * Money vs enjoyment scale.
 * Higher concert rating + lower spend → better value.
 * Meter uses a soft (diminishing) curve so cheap/free outliers don't
 * stretch the bar to the end and crush typical concerts.
 */
export function moneyVsEnjoymentScale(
  concertRating: number,
  total: number
): ValueScale {
  const rating = toNumber(concertRating);
  const funPer100 = funPointsPer100(rating, total);

  if (funPer100 === null) {
    return {
      meter: 0,
      funPer100: null,
      tier: "unknown",
      label: "Add costs to see value",
      detail: "Enter spending so we can compare cost to your concert rating.",
      colorClass: "badge-ghost",
      barClass: "bg-base-300",
    };
  }

  // Soft curve: mid-range concerts land near the middle; outliers asymptote to 100.
  const meter = Math.max(
    0,
    Math.min(100, (1 - Math.exp(-funPer100 / 4.5)) * 100)
  );
  const ratingLabel = formatNumber(rating, 2);

  if (funPer100 < 2) {
    return {
      meter,
      funPer100,
      tier: "poor",
      label: "Steep for the fun",
      detail: `You spent ${formatMoney(total)} for a ${ratingLabel}/10 night — pricey relative to the enjoyment.`,
      colorClass: "badge-error",
      barClass: "bg-error",
    };
  }
  if (funPer100 < 4) {
    return {
      meter,
      funPer100,
      tier: "fair",
      label: "Fair value",
      detail: `Okay trade-off: ${ratingLabel}/10 enjoyment for ${formatMoney(total)}.`,
      colorClass: "badge-warning",
      barClass: "bg-warning",
    };
  }
  if (funPer100 < 7) {
    return {
      meter,
      funPer100,
      tier: "good",
      label: "Good value",
      detail: `Solid night — ${ratingLabel}/10 fun for ${formatMoney(total)}.`,
      colorClass: "badge-info",
      barClass: "bg-info",
    };
  }
  if (funPer100 < 12) {
    return {
      meter,
      funPer100,
      tier: "great",
      label: "Great value",
      detail: `Strong bang for your buck: ${ratingLabel}/10 for ${formatMoney(total)}.`,
      colorClass: "badge-success",
      barClass: "bg-success",
    };
  }
  return {
    meter,
    funPer100,
    tier: "amazing",
    label: "Amazing value",
    detail: `Huge win — lots of enjoyment (${ratingLabel}/10) for ${formatMoney(total)}.`,
    colorClass: "badge-primary",
    barClass: "bg-primary",
  };
}

/** Bar width 0–100 that resists being stretched by a single huge outlier. */
export function evenBarPercent(value: number, maxValue: number): number {
  if (value <= 0 || maxValue <= 0) return 0;
  const scaled = Math.log1p(value) / Math.log1p(maxValue);
  return Math.max(6, Math.min(100, Math.round(scaled * 100)));
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Rating averages always shown with exactly 2 decimal places. */
export function formatRatingAverage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMetric(value: number | null, suffix = ""): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${formatNumber(value)}${suffix}`;
}

export const COST_CATEGORIES = [
  { key: "ticket_cost" as const, label: "Tickets" },
  { key: "ticket_fees" as const, label: "Fees" },
  { key: "parking_cost" as const, label: "Parking" },
  { key: "food_drink_cost" as const, label: "Food & Drink" },
  { key: "merchandise_cost" as const, label: "Merch" },
  { key: "lodging_cost" as const, label: "Lodging" },
  { key: "travel_cost" as const, label: "Travel / Gas" },
  { key: "other_cost" as const, label: "Other" },
];
