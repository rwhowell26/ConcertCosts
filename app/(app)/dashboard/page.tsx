import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/EmptyState";
import { DashboardStats } from "@/components/DashboardStats";
import { DashboardCharts } from "@/components/DashboardCharts";
import type { Concert } from "@/lib/metrics";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-base-content/70 text-sm mt-1">
          A quick look at your concert spending, ratings, and money vs enjoyment.
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
        <>
          <DashboardStats concerts={concerts} />
          <DashboardCharts concerts={concerts} />
        </>
      )}
    </div>
  );
}
