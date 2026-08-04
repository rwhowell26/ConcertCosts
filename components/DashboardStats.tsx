import {
  Concert,
  costPerHour,
  formatMetric,
  formatMoney,
  formatRatingAverage,
  moneyVsEnjoymentScale,
  totalCost,
  toNumber,
} from "@/lib/metrics";
import { ValueScaleMeter } from "@/components/ValueScaleMeter";

type Props = {
  concerts: Concert[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="stat bg-base-100 border border-base-300 rounded-box shadow-sm p-4">
      <div className="stat-title text-xs sm:text-sm">{label}</div>
      <div className="stat-value text-lg sm:text-2xl break-words">{value}</div>
      {hint && <div className="stat-desc">{hint}</div>}
    </div>
  );
}

export function DashboardStats({ concerts }: Props) {
  const totals = concerts.map((c) => {
    const total = totalCost(c);
    const value = moneyVsEnjoymentScale(c.fun_rating, total);
    return {
      concert: c,
      total,
      cph: costPerHour(total, c.hours_at_event),
      value,
    };
  });

  const count = concerts.length;
  const spent = totals.reduce((s, t) => s + t.total, 0);
  const avgCost = count ? spent / count : 0;
  const avgFun = count
    ? concerts.reduce((s, c) => s + toNumber(c.fun_rating), 0) / count
    : 0;
  const cphValues = totals
    .map((t) => t.cph)
    .filter((v): v is number => v !== null);
  const avgCph =
    cphValues.length > 0
      ? cphValues.reduce((a, b) => a + b, 0) / cphValues.length
      : null;

  const bestValue = totals
    .filter((t) => t.value.funPer100 !== null)
    .sort((a, b) => (b.value.funPer100 ?? 0) - (a.value.funPer100 ?? 0))[0];
  const mostExpensive = [...totals].sort((a, b) => b.total - a.total)[0];
  const highestFun = [...concerts].sort(
    (a, b) => toNumber(b.fun_rating) - toNumber(a.fun_rating)
  )[0];

  const avgRating = avgFun;
  const overallScale = moneyVsEnjoymentScale(
    avgRating || 1,
    avgCost || 0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total concerts" value={String(count)} />
        <StatCard label="Total spent" value={formatMoney(spent)} />
        <StatCard label="Avg cost / concert" value={formatMoney(avgCost)} />
        <StatCard
          label="Avg concert rating"
          value={`${formatRatingAverage(avgFun)} / 10`}
        />
        <StatCard
          label="Avg cost per hour"
          value={avgCph === null ? "—" : formatMoney(avgCph)}
        />
        <StatCard
          label="Best value concert"
          value={bestValue?.concert.concert_name ?? "—"}
          hint={bestValue ? bestValue.value.label : undefined}
        />
        <StatCard
          label="Most expensive"
          value={mostExpensive?.concert.concert_name ?? "—"}
          hint={
            mostExpensive ? formatMoney(mostExpensive.total) : undefined
          }
        />
        <StatCard
          label="Highest concert rating"
          value={highestFun?.concert_name ?? "—"}
          hint={
            highestFun ? `${highestFun.fun_rating} / 10` : undefined
          }
        />
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-3">
          <h3 className="font-semibold text-lg">Overall money vs enjoyment</h3>
          <p className="text-sm text-base-content/60 -mt-1">
            Based on your average concert rating and average cost per show.
          </p>
          <ValueScaleMeter
            concertRating={avgRating || 1}
            totalCost={avgCost}
            scale={overallScale}
          />
          {bestValue && (
            <p className="text-sm text-base-content/70">
              Best bang for your buck so far:{" "}
              <span className="font-semibold">
                {bestValue.concert.concert_name}
              </span>{" "}
              ({bestValue.value.label})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
