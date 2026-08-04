import { createClient } from "@/lib/supabase/server";
import { ArtistsList } from "@/components/ArtistsList";
import { buildArtistSummaries } from "@/lib/artists";
import type { Concert } from "@/lib/metrics";

export default async function ArtistsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .order("concert_date", { ascending: false });

  const concerts = (data ?? []) as Concert[];
  const artists = buildArtistSummaries(concerts);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Artists</h2>
        <p className="text-base-content/70 text-sm mt-1">
          Artists you’ve seen, sorted by most shows first. Tap one for your
          averages and a most-seen leaderboard.
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>Could not load artists: {error.message}</span>
        </div>
      )}

      <ArtistsList artists={artists} />
    </div>
  );
}
