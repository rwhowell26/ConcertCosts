import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  showAddLink?: boolean;
};

export function EmptyState({
  title = "No concerts logged yet",
  message = "No concerts logged yet. Add your first concert to start seeing your dashboard.",
  showAddLink = true,
}: Props) {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm">
      <div className="card-body items-center text-center py-16 px-6">
        <div className="text-5xl opacity-40 mb-2" aria-hidden>
          ♪
        </div>
        <h2 className="card-title text-xl">{title}</h2>
        <p className="text-base-content/70 max-w-md">{message}</p>
        {showAddLink && (
          <div className="card-actions mt-4">
            <Link href="/add-concert" className="btn btn-primary">
              Add your first concert
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
