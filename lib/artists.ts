import {
  Concert,
  costPerHour,
  funPointsPer100,
  moneyVsEnjoymentScale,
  totalCost,
  toNumber,
  type ValueScale,
} from "@/lib/metrics";

export type ArtistSummary = {
  artist: string;
  showCount: number;
  avgTotalCost: number;
  avgCostPerHour: number | null;
  avgRating: number;
  avgFunPer100: number | null;
  avgMiles: number;
  avgHours: number;
  valueScale: ValueScale;
};

export type LeaderboardEntry = {
  name: string;
  showCount: number;
  isYou: boolean;
  rank: number;
};

const DEMO_NAMES = [
  "Alex Rivera",
  "Jordan Lee",
  "Sam Patel",
  "Casey Nguyen",
  "Riley Brooks",
  "Morgan Blake",
  "Quinn Harper",
  "Avery Cole",
  "Jamie Ortiz",
  "Taylor Kim",
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function buildArtistSummaries(concerts: Concert[]): ArtistSummary[] {
  const byArtist = new Map<string, Concert[]>();

  for (const c of concerts) {
    const key = c.artist.trim() || "Unknown artist";
    const list = byArtist.get(key) ?? [];
    list.push(c);
    byArtist.set(key, list);
  }

  const summaries: ArtistSummary[] = [];

  for (const [artist, list] of byArtist) {
    const totals = list.map((c) => totalCost(c));
    const ratings = list.map((c) => toNumber(c.fun_rating));
    const miles = list.map((c) => toNumber(c.distance_from_home));
    const hours = list.map((c) => toNumber(c.hours_at_event));

    const avgTotalCost =
      totals.reduce((s, t) => s + t, 0) / Math.max(list.length, 1);
    const avgRating =
      ratings.reduce((s, r) => s + r, 0) / Math.max(list.length, 1);
    const avgMiles = miles.reduce((s, m) => s + m, 0) / Math.max(list.length, 1);
    const avgHours = hours.reduce((s, h) => s + h, 0) / Math.max(list.length, 1);

    const cphValues = list
      .map((c, i) => costPerHour(totals[i], hours[i]))
      .filter((v): v is number => v !== null);
    const avgCostPerHour =
      cphValues.length > 0
        ? cphValues.reduce((s, v) => s + v, 0) / cphValues.length
        : null;

    const ratioValues = list
      .map((c, i) => funPointsPer100(ratings[i], totals[i]))
      .filter((v): v is number => v !== null);
    const avgFunPer100 =
      ratioValues.length > 0
        ? ratioValues.reduce((s, v) => s + v, 0) / ratioValues.length
        : null;

    summaries.push({
      artist,
      showCount: list.length,
      avgTotalCost,
      avgCostPerHour,
      avgRating,
      avgFunPer100,
      avgMiles,
      avgHours,
      valueScale: moneyVsEnjoymentScale(avgRating, avgTotalCost),
    });
  }

  summaries.sort((a, b) => {
    if (b.showCount !== a.showCount) return b.showCount - a.showCount;
    return a.artist.localeCompare(b.artist);
  });

  return summaries;
}

/**
 * Demo leaderboard for an artist: sample fans + you.
 * Returns top 4 (with you highlighted if included) and optional outside rank.
 */
export function buildArtistLeaderboard(
  artist: string,
  yourShowCount: number
): { top4: LeaderboardEntry[]; yourOutsideRank: LeaderboardEntry | null } {
  const seed = hashString(artist.toLowerCase());
  const demoFans = DEMO_NAMES.map((name, i) => {
    const wobble = ((seed >> (i * 3)) & 7) + ((seed >> i) & 3);
    // Spread demo counts around / above / below the user for variety
    let showCount = Math.max(1, yourShowCount + wobble - 4 + (i % 3));
    if (i === 0) showCount = Math.max(showCount, yourShowCount + 2 + (seed % 3));
    if (i === 1) showCount = Math.max(1, yourShowCount + 1 + (seed % 2));
    if (i === 2) showCount = Math.max(1, Math.max(yourShowCount - 1, 1) + (seed % 2));
    return { name, showCount, isYou: false };
  });

  const everyone = [
    ...demoFans,
    { name: "You", showCount: yourShowCount, isYou: true },
  ];

  everyone.sort((a, b) => {
    if (b.showCount !== a.showCount) return b.showCount - a.showCount;
    if (a.isYou !== b.isYou) return a.isYou ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  let rank = 0;
  let lastCount: number | null = null;
  let index = 0;
  const ranked: LeaderboardEntry[] = [];

  for (const row of everyone) {
    index += 1;
    if (lastCount === null || row.showCount !== lastCount) {
      rank = index;
      lastCount = row.showCount;
    }
    ranked.push({ ...row, rank });
  }

  const top4 = ranked.filter((r) => r.rank <= 4);
  // If ties push past 4 visible rows with rank<=4, still ok (show all tied at cutoff)
  const you = ranked.find((r) => r.isYou) ?? null;
  const youInTop = you ? top4.some((r) => r.isYou) : false;

  return {
    top4,
    yourOutsideRank: you && !youInTop ? you : null,
  };
}
