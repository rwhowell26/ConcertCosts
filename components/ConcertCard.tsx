import Link from "next/link";
import {
  Concert,
  COST_CATEGORIES,
  costPerHour,
  formatMetric,
  formatMoney,
  moneyVsEnjoymentScale,
  totalCost,
  toNumber,
} from "@/lib/metrics";
import type { ComparisonAverages } from "@/lib/compare";
import { ValueScaleMeter } from "@/components/ValueScaleMeter";
import { ComparePeersButton } from "@/components/ComparePeersButton";

type Props = {
  concert: Concert;
  userAverages: ComparisonAverages;
};

export function ConcertCard({ concert, userAverages }: Props) {
  const total = totalCost(concert);
  const cph = costPerHour(total, concert.hours_at_event);
  const value = moneyVsEnjoymentScale(concert.fun_rating, total);
  const dateLabel = new Date(
    concert.concert_date + "T12:00:00"
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const breakdown = COST_CATEGORIES.filter(
    (c) => toNumber(concert[c.key]) > 0
  );

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h2 className="card-title text-xl">{concert.concert_name}</h2>
            <p className="text-base-content/80 font-medium">{concert.artist}</p>
            <p className="text-sm text-base-content/60">
              {concert.venue} · {concert.city}, {concert.state}
            </p>
            <p className="text-sm text-base-content/60">{dateLabel}</p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <div className="badge badge-primary badge-lg">
                {formatMoney(total)}
              </div>
              <div className="badge badge-secondary badge-lg">
                Rating {concert.fun_rating}/10
              </div>
              <div className={`badge ${value.colorClass} badge-lg`}>
                {value.label}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <ComparePeersButton yours={userAverages} />
              <Link
                href={`/concerts/${concert.id}/edit`}
                className="btn btn-outline btn-sm"
              >
                Edit concert
              </Link>
            </div>
          </div>
        </div>

        <ValueScaleMeter
          concertRating={concert.fun_rating}
          totalCost={total}
          scale={value}
          compact
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-box bg-base-200 p-3">
            <p className="text-xs text-base-content/60">Cost per hour</p>
            <p className="font-semibold">
              {cph === null ? "—" : formatMoney(cph)}
            </p>
          </div>
          <div className="rounded-box bg-base-200 p-3">
            <p className="text-xs text-base-content/60">Fun Points / $100</p>
            <p className="font-semibold">{formatMetric(value.funPer100)}</p>
          </div>
          <div className="rounded-box bg-base-200 p-3">
            <p className="text-xs text-base-content/60">Miles from home</p>
            <p className="font-semibold">
              {formatMetric(toNumber(concert.distance_from_home), " mi")}
            </p>
          </div>
          <div className="rounded-box bg-base-200 p-3">
            <p className="text-xs text-base-content/60">Hours at event</p>
            <p className="font-semibold">
              {formatMetric(toNumber(concert.hours_at_event), " hrs")}
            </p>
          </div>
        </div>

        {breakdown.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Main cost categories</p>
            <div className="flex flex-wrap gap-2">
              {breakdown.map((c) => (
                <span key={c.key} className="badge badge-outline gap-1">
                  {c.label}: {formatMoney(toNumber(concert[c.key]))}
                </span>
              ))}
            </div>
          </div>
        )}

        {concert.notes && (
          <div className="rounded-box bg-base-200/70 p-3 text-sm">
            <p className="font-medium mb-1">Notes</p>
            <p className="text-base-content/80 whitespace-pre-wrap">
              {concert.notes}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
