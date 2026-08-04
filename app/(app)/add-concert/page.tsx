import { ConcertForm } from "@/components/ConcertForm";

export default function AddConcertPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add Concert</h2>
        <p className="text-base-content/70 text-sm mt-1">
          Fill in the show details, costs, and how fun it was. Total cost
          updates as you type.
        </p>
      </div>
      <ConcertForm />
    </div>
  );
}
