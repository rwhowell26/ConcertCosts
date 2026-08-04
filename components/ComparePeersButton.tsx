"use client";

import { useId, useRef } from "react";
import {
  formatMetric,
  formatMoney,
  formatNumber,
} from "@/lib/metrics";
import {
  TYPICAL_FAN_AVERAGES,
  comparisonVerdict,
  type ComparisonAverages,
} from "@/lib/compare";

type Props = {
  yours: ComparisonAverages;
};

function SideCard({
  title,
  subtitle,
  avgRating,
  avgMoneySpent,
  avgEnjoymentRatio,
  highlight,
}: {
  title: string;
  subtitle: string;
  avgRating: number;
  avgMoneySpent: number;
  avgEnjoymentRatio: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-box border p-4 space-y-3 ${
        highlight
          ? "border-primary bg-primary/10"
          : "border-base-300 bg-base-200/60"
      }`}
    >
      <div>
        <p className="font-bold text-lg">{title}</p>
        <p className="text-xs text-base-content/60">{subtitle}</p>
      </div>

      <div className="stat bg-base-100 rounded-box p-3 border border-base-300">
        <div className="stat-title text-xs">Avg concert rating</div>
        <div className="stat-value text-xl">
          {formatNumber(avgRating, 1)} / 10
        </div>
      </div>

      <div className="stat bg-base-100 rounded-box p-3 border border-base-300">
        <div className="stat-title text-xs">Avg money spent</div>
        <div className="stat-value text-xl">
          {formatMoney(avgMoneySpent)}
        </div>
        <div className="stat-desc">Per concert</div>
      </div>

      <div className="stat bg-base-100 rounded-box p-3 border border-base-300">
        <div className="stat-title text-xs">Avg enjoyment ratio</div>
        <div className="stat-value text-xl">
          {formatMetric(avgEnjoymentRatio)}
        </div>
        <div className="stat-desc">Fun Points per $100</div>
      </div>
    </div>
  );
}

function VerdictLine({
  label,
  yours,
  theirs,
  higherIsBetter,
  format,
  winLabel = "You’re ahead",
  loseLabel = "Typical fans are ahead",
}: {
  label: string;
  yours: number | null;
  theirs: number | null;
  higherIsBetter: boolean;
  format: (v: number) => string;
  winLabel?: string;
  loseLabel?: string;
}) {
  const verdict = comparisonVerdict(yours, theirs, higherIsBetter);
  const text =
    verdict === "you"
      ? winLabel
      : verdict === "them"
        ? loseLabel
        : verdict === "tie"
          ? "About even"
          : "Not enough data";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-base-content/70">{label}</span>
      <span className="font-medium">
        {text}
        {yours !== null && theirs !== null && (
          <span className="text-base-content/50 font-normal">
            {" "}
            ({format(yours)} vs {format(theirs)})
          </span>
        )}
      </span>
    </div>
  );
}

export function ComparePeersButton({ yours }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const peers = TYPICAL_FAN_AVERAGES;

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className="btn btn-soft btn-sm" onClick={open}>
        Compare to others
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-3xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 id={titleId} className="font-bold text-xl">
                You vs typical fans
              </h3>
              <p className="text-sm text-base-content/70 mt-1">
                Overall account averages compared with sample fan averages
                (demo data until more real users join).
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={close}
              aria-label="Close comparison"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SideCard
              title="You"
              subtitle={`Based on ${yours.concertCount} concert${
                yours.concertCount === 1 ? "" : "s"
              } you’ve logged`}
              avgRating={yours.avgRating}
              avgMoneySpent={yours.avgMoneySpent}
              avgEnjoymentRatio={yours.avgEnjoymentRatio}
              highlight
            />
            <SideCard
              title="Typical fans"
              subtitle="Sample average across demo concert-goers"
              avgRating={peers.avgRating}
              avgMoneySpent={peers.avgMoneySpent}
              avgEnjoymentRatio={peers.avgEnjoymentRatio}
            />
          </div>

          <div className="rounded-box border border-base-300 bg-base-200/50 p-3 space-y-2">
            <p className="text-sm font-semibold">Quick takeaways</p>
            <VerdictLine
              label="Concert rating"
              yours={yours.avgRating}
              theirs={peers.avgRating}
              higherIsBetter
              format={(v) => `${formatNumber(v, 1)}/10`}
            />
            <VerdictLine
              label="Money spent"
              yours={yours.avgMoneySpent}
              theirs={peers.avgMoneySpent}
              higherIsBetter
              winLabel="You spend more on average"
              loseLabel="Typical fans spend more on average"
              format={(v) => formatMoney(v)}
            />
            <VerdictLine
              label="Enjoyment ratio"
              yours={yours.avgEnjoymentRatio}
              theirs={peers.avgEnjoymentRatio}
              higherIsBetter
              format={(v) => formatNumber(v)}
            />
          </div>

          <div className="modal-action mt-2">
            <button type="button" className="btn" onClick={close}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
}
