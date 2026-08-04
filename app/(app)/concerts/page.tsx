import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import { ConcertCard } from "@/components/ConcertCard";
import { computeUserAverages } from "@/lib/compare";
import type { Concert } from "@/lib/metrics";

export default async function ConcertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];
  const userAverages = computeUserAverages(concerts);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Concerts</h2>
        <p className="text-base-content/70 text-sm mt-1">
          Every show you have logged — costs, fun, and value at a glance. Use
          Compare to others to see how your overall averages stack up against
          typical fans.
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>Could not load concerts: {error.message}</span>
        </div>
      )}

      {concerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {concerts.map((concert) => (
            <ConcertCard
              key={concert.id}
              concert={concert}
              userAverages={userAverages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
