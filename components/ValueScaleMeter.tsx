import {
  formatMetric,
  moneyVsEnjoymentScale,
  type ValueScale,
} from "@/lib/metrics";

type Props = {
  concertRating: number;
  totalCost: number;
  compact?: boolean;
  /** Optional precomputed scale (avoids double calc) */
  scale?: ValueScale;
};

export function ValueScaleMeter({
  concertRating,
  totalCost: total,
  compact = false,
  scale: scaleProp,
}: Props) {
  const scale = scaleProp ?? moneyVsEnjoymentScale(concertRating, total);

  return (
    <div
      className={`rounded-box border border-base-300 bg-base-200/80 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-semibold">Money vs enjoyment</p>
          {!compact && (
            <p className="text-xs text-base-content/60">
              Compares what you spent to your concert rating
            </p>
          )}
        </div>
        <span className={`badge ${scale.colorClass} badge-lg`}>
          {scale.label}
        </span>
      </div>

      <div
        className="w-full bg-base-300 rounded-full h-3 overflow-hidden"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scale.meter)}
        aria-label="Money versus enjoyment value"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${scale.barClass}`}
          style={{ width: `${scale.meter}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] sm:text-xs text-base-content/50 mt-1 px-0.5">
        <span>Spent a lot / less fun</span>
        <span>Spent less / more fun</span>
      </div>

      <p className={`text-sm text-base-content/80 ${compact ? "mt-2" : "mt-3"}`}>
        {scale.detail}
      </p>

      {scale.funPer100 !== null && (
        <p className="text-xs text-base-content/55 mt-1">
          Fun Points per $100: {formatMetric(scale.funPer100)}
        </p>
      )}
    </div>
  );
}
