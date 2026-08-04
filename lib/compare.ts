import {
  Concert,
  funPointsPer100,
  totalCost,
  toNumber,
} from "@/lib/metrics";

export type ComparisonAverages = {
  avgRating: number;
  avgMoneySpent: number;
  avgEnjoymentRatio: number | null;
  concertCount: number;
};

/**
 * Demo “typical fans” averages — sample data used until real peer
 * accounts exist. Built to look like a mid-range concert-goer mix.
 */
export const TYPICAL_FAN_AVERAGES: ComparisonAverages = {
  avgRating: 7.4,
  avgMoneySpent: 268.5,
  avgEnjoymentRatio: 3.15,
  concertCount: 48,
};

export function computeUserAverages(
  concerts: Concert[]
): ComparisonAverages {
  if (concerts.length === 0) {
    return {
      avgRating: 0,
      avgMoneySpent: 0,
      avgEnjoymentRatio: null,
      concertCount: 0,
    };
  }

  const totals = concerts.map((c) => totalCost(c));
  const ratings = concerts.map((c) => toNumber(c.fun_rating));
  const ratios = concerts
    .map((c, i) => funPointsPer100(ratings[i], totals[i]))
    .filter((v): v is number => v !== null);

  const avgRating =
    ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const avgMoneySpent =
    totals.reduce((sum, t) => sum + t, 0) / totals.length;
  const avgEnjoymentRatio =
    ratios.length > 0
      ? ratios.reduce((sum, r) => sum + r, 0) / ratios.length
      : null;

  return {
    avgRating,
    avgMoneySpent,
    avgEnjoymentRatio,
    concertCount: concerts.length,
  };
}

export function comparisonVerdict(
  yours: number | null,
  theirs: number | null,
  higherIsBetter: boolean
): "you" | "them" | "tie" | "unknown" {
  if (yours === null || theirs === null) return "unknown";
  const diff = yours - theirs;
  if (Math.abs(diff) < 0.05) return "tie";
  if (higherIsBetter) return diff > 0 ? "you" : "them";
  return diff < 0 ? "you" : "them";
}
