import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConcertForm } from "@/components/ConcertForm";
import type { Concert } from "@/lib/metrics";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditConcertPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concerts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const concert = data as Concert;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Edit Concert</h2>
          <p className="text-base-content/70 text-sm mt-1">
            Update details, costs, or your rating for{" "}
            <span className="font-medium text-base-content">
              {concert.concert_name}
            </span>
            .
          </p>
        </div>
        <Link href="/concerts" className="btn btn-ghost btn-sm">
          Back to My Concerts
        </Link>
      </div>
      <ConcertForm concert={concert} />
    </div>
  );
}
