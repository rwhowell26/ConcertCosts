"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Concert,
  COST_CATEGORIES,
  evenBarPercent,
  formatMoney,
  formatNumber,
  formatRatingAverage,
  funPointsPer100,
  totalCost,
  toNumber,
} from "@/lib/metrics";

const PIE_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#22c55e",
  "#06b6d4",
];

type RankItem = {
  id: string;
  name: string;
  artist: string;
  value: number;
  rank: number;
};

type MetricKey = "total" | "fun" | "funPer100";

function buildRankedItems(
  concerts: Concert[],
  metric: MetricKey
): RankItem[] {
  const rows = concerts.map((c) => {
    const total = totalCost(c);
    let value = 0;
    if (metric === "total") value = total;
    else if (metric === "fun") value = toNumber(c.fun_rating);
    else value = funPointsPer100(c.fun_rating, total) ?? 0;

    return {
      id: c.id,
      name: c.concert_name,
      artist: c.artist,
      value,
    };
  });

  rows.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.name.localeCompare(b.name);
  });

  // Competition ranking: ties share a place (1, 2, 2, 4…)
  let rank = 0;
  let lastValue: number | null = null;
  let index = 0;
  const ranked: RankItem[] = [];

  for (const row of rows) {
    index += 1;
    if (lastValue === null || row.value !== lastValue) {
      rank = index;
      lastValue = row.value;
    }
    ranked.push({ ...row, rank });
  }

  return ranked;
}

/** Top 5 places, including every concert tied at rank 5. */
function topFiveWithTies(ranked: RankItem[]): RankItem[] {
  return ranked.filter((r) => r.rank <= 5);
}

function formatMetricValue(metric: MetricKey, value: number): string {
  if (metric === "total") return formatMoney(value);
  if (metric === "fun") return `${formatRatingAverage(value)} / 10`;
  return formatNumber(value);
}

function RankingPanel({
  title,
  metric,
  concerts,
  barClass,
}: {
  title: string;
  metric: MetricKey;
  concerts: Concert[];
  barClass: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(
    () => buildRankedItems(concerts, metric),
    [concerts, metric]
  );
  const top = useMemo(() => topFiveWithTies(ranked), [ranked]);
  const visible = showAll ? ranked : top;
  const maxValue = ranked[0]?.value ?? 0;
  const canExpand = ranked.length > top.length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              {showAll
                ? `Full ranking · ${ranked.length} concerts`
                : `Top 5${top.length > 5 ? ` (${top.length} with ties)` : ""} · highest first`}
            </p>
          </div>
          {canExpand && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show top 5" : "Show all concerts"}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-base-content/60">No concerts yet.</p>
        ) : (
          <ol className="space-y-2">
            {visible.map((item) => {
              const width = evenBarPercent(item.value, maxValue);
              return (
                <li
                  key={`${metric}-${item.id}`}
                  className="rounded-box bg-base-200/70 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="badge badge-neutral badge-sm w-10 justify-center font-bold shrink-0">
                      #{item.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm font-semibold tabular-nums shrink-0">
                          {formatMetricValue(metric, item.value)}
                        </p>
                      </div>
                      <p className="text-xs text-base-content/60 truncate">
                        {item.artist}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-base-300 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barClass}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {!showAll && canExpand && (
          <p className="text-xs text-base-content/50 text-center">
            {ranked.length - top.length} more hidden — tap Show all concerts
          </p>
        )}
      </div>
    </div>
  );
}

type ArtistRankItem = {
  artist: string;
  shows: number;
  rank: number;
};

function buildArtistRanking(concerts: Concert[]): ArtistRankItem[] {
  const counts = new Map<string, number>();
  for (const c of concerts) {
    const key = c.artist.trim() || "Unknown artist";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const rows = [...counts.entries()].map(([artist, shows]) => ({
    artist,
    shows,
  }));

  rows.sort((a, b) => {
    if (b.shows !== a.shows) return b.shows - a.shows;
    return a.artist.localeCompare(b.artist);
  });

  let rank = 0;
  let lastShows: number | null = null;
  let index = 0;
  const ranked: ArtistRankItem[] = [];

  for (const row of rows) {
    index += 1;
    if (lastShows === null || row.shows !== lastShows) {
      rank = index;
      lastShows = row.shows;
    }
    ranked.push({ ...row, rank });
  }

  return ranked;
}

function ArtistRankingPanel({ concerts }: { concerts: Concert[] }) {
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => buildArtistRanking(concerts), [concerts]);
  const top = useMemo(
    () => ranked.filter((r) => r.rank <= 5),
    [ranked]
  );
  const visible = showAll ? ranked : top;
  const maxShows = ranked[0]?.shows ?? 0;
  const canExpand = ranked.length > top.length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">Most seen artists</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              {showAll
                ? `Full ranking · ${ranked.length} artists`
                : `Top 5${top.length > 5 ? ` (${top.length} with ties)` : ""} · most shows first`}
            </p>
          </div>
          {canExpand && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show top 5" : "Show all artists"}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-base-content/60">No concerts yet.</p>
        ) : (
          <ol className="space-y-2">
            {visible.map((item) => {
              const width = evenBarPercent(item.shows, maxShows);
              return (
                <li
                  key={`artist-${item.artist}`}
                  className="rounded-box bg-base-200/70 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="badge badge-neutral badge-sm w-10 justify-center font-bold shrink-0">
                      #{item.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <p className="font-medium truncate">{item.artist}</p>
                        <p className="text-sm font-semibold tabular-nums shrink-0">
                          {item.shows} {item.shows === 1 ? "show" : "shows"}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-base-300 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {!showAll && canExpand && (
          <p className="text-xs text-base-content/50 text-center">
            {ranked.length - top.length} more hidden — tap Show all artists
          </p>
        )}
      </div>
    </div>
  );
}

type Props = {
  concerts: Concert[];
};

export function DashboardCharts({ concerts }: Props) {
  const categoryTotals = COST_CATEGORIES.map((c) => ({
    name: c.label,
    value: concerts.reduce((sum, row) => sum + toNumber(row[c.key]), 0),
  })).filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card bg-base-100 border border-base-300 shadow-sm min-h-[20rem]">
        <div className="card-body">
          <h3 className="font-semibold">Spending by cost category</h3>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-base-content/60">No spending yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={({ name }) => name}
                  >
                    {categoryTotals.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatMoney(
                        typeof value === "number" ? value : Number(value)
                      )
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <ArtistRankingPanel concerts={concerts} />

      <RankingPanel
        title="Total cost ranking"
        metric="total"
        concerts={concerts}
        barClass="bg-primary"
      />

      <RankingPanel
        title="Concert rating ranking"
        metric="fun"
        concerts={concerts}
        barClass="bg-secondary"
      />

      <RankingPanel
        title="Fun Points per $100 ranking"
        metric="funPer100"
        concerts={concerts}
        barClass="bg-accent"
      />
    </div>
  );
}
