"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatMetric,
  formatMoney,
  formatNumber,
} from "@/lib/metrics";
import {
  buildArtistLeaderboard,
  type ArtistSummary,
} from "@/lib/artists";
import { ValueScaleMeter } from "@/components/ValueScaleMeter";
import { EmptyState } from "@/components/EmptyState";

type Props = {
  artists: ArtistSummary[];
};

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="stat bg-base-100 border border-base-300 rounded-box p-3">
      <div className="stat-title text-xs">{label}</div>
      <div className="stat-value text-lg sm:text-xl break-words">{value}</div>
    </div>
  );
}

export function ArtistsList({ artists }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<ArtistSummary | null>(null);

  const leaderboard = useMemo(() => {
    if (!selected) return null;
    return buildArtistLeaderboard(selected.artist, selected.showCount);
  }, [selected]);

  useEffect(() => {
    if (selected) {
      dialogRef.current?.showModal();
    }
  }, [selected]);

  function openArtist(artist: ArtistSummary) {
    setSelected(artist);
  }

  function close() {
    dialogRef.current?.close();
  }

  if (artists.length === 0) {
    return (
      <EmptyState
        title="No artists yet"
        message="No concerts logged yet. Add your first concert to start seeing your artists."
      />
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {artists.map((artist) => (
          <li key={artist.artist}>
            <button
              type="button"
              onClick={() => openArtist(artist)}
              className="w-full text-left rounded-box border border-base-300 bg-base-100 hover:bg-base-200/80 transition-colors px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{artist.artist}</p>
                <p className="text-xs text-base-content/60">
                  Tap for profile & leaderboard
                </p>
              </div>
              <span className="badge badge-primary badge-lg shrink-0">
                {artist.showCount}{" "}
                {artist.showCount === 1 ? "show" : "shows"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} className="modal" onClose={() => setSelected(null)}>
        <div className="modal-box max-w-2xl space-y-5">
          {selected && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={titleId} className="font-bold text-2xl">
                    {selected.artist}
                  </h3>
                  <p className="text-sm text-base-content/70 mt-1">
                    Your averages across {selected.showCount}{" "}
                    {selected.showCount === 1 ? "concert" : "concerts"} you’ve
                    logged for this artist.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={close}
                  aria-label="Close artist profile"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Stat
                  label="Shows you’ve seen"
                  value={String(selected.showCount)}
                />
                <Stat
                  label="Avg concert rating"
                  value={`${formatNumber(selected.avgRating, 1)} / 10`}
                />
                <Stat
                  label="Avg total cost"
                  value={formatMoney(selected.avgTotalCost)}
                />
                <Stat
                  label="Avg cost per hour"
                  value={
                    selected.avgCostPerHour === null
                      ? "—"
                      : formatMoney(selected.avgCostPerHour)
                  }
                />
                <Stat
                  label="Avg Fun Points / $100"
                  value={formatMetric(selected.avgFunPer100)}
                />
                <Stat
                  label="Avg miles from home"
                  value={formatMetric(selected.avgMiles, " mi")}
                />
                <Stat
                  label="Avg hours at event"
                  value={formatMetric(selected.avgHours, " hrs")}
                />
                <Stat
                  label="Money vs enjoyment"
                  value={selected.valueScale.label}
                />
              </div>

              <ValueScaleMeter
                concertRating={selected.avgRating}
                totalCost={selected.avgTotalCost}
                scale={selected.valueScale}
                compact
              />

              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Most times seen</h4>
                  <p className="text-xs text-base-content/60">
                    Top fans for this artist (sample/demo fans until more real
                    users join). Name + show count.
                  </p>
                </div>

                {leaderboard && (
                  <ol className="space-y-2">
                    {leaderboard.top4.map((row) => (
                      <li
                        key={`${row.name}-${row.rank}`}
                        className={`rounded-box px-3 py-2 flex items-center justify-between gap-3 border ${
                          row.isYou
                            ? "border-primary bg-primary/10"
                            : "border-base-300 bg-base-200/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="badge badge-neutral badge-sm w-10 justify-center font-bold">
                            #{row.rank}
                          </span>
                          <span className="font-medium truncate">
                            {row.name}
                            {row.isYou ? " (you)" : ""}
                          </span>
                        </div>
                        <span className="text-sm font-semibold shrink-0">
                          {row.showCount}{" "}
                          {row.showCount === 1 ? "show" : "shows"}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {leaderboard?.yourOutsideRank && (
                  <div className="rounded-box border border-dashed border-base-300 px-3 py-2 flex items-center justify-between gap-3 bg-base-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="badge badge-outline badge-sm w-10 justify-center font-bold">
                        #{leaderboard.yourOutsideRank.rank}
                      </span>
                      <span className="font-medium">Your rank</span>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {leaderboard.yourOutsideRank.showCount}{" "}
                      {leaderboard.yourOutsideRank.showCount === 1
                        ? "show"
                        : "shows"}
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-action mt-2">
                <button type="button" className="btn" onClick={close}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
}
