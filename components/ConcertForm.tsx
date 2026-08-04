"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatMoney,
  totalCost,
  toNumber,
  type Concert,
} from "@/lib/metrics";
import { ValueScaleMeter } from "@/components/ValueScaleMeter";

const emptyForm = {
  concert_name: "",
  artist: "",
  venue: "",
  city: "",
  state: "",
  concert_date: "",
  distance_from_home: "0",
  hours_at_event: "0",
  ticket_cost: "0",
  ticket_fees: "0",
  parking_cost: "0",
  food_drink_cost: "0",
  merchandise_cost: "0",
  lodging_cost: "0",
  travel_cost: "0",
  other_cost: "0",
  fun_rating: "7",
  notes: "",
};

type FormState = typeof emptyForm;

function n(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function concertToForm(concert: Concert): FormState {
  return {
    concert_name: concert.concert_name,
    artist: concert.artist,
    venue: concert.venue,
    city: concert.city,
    state: concert.state,
    concert_date: concert.concert_date,
    distance_from_home: String(toNumber(concert.distance_from_home)),
    hours_at_event: String(toNumber(concert.hours_at_event)),
    ticket_cost: String(toNumber(concert.ticket_cost)),
    ticket_fees: String(toNumber(concert.ticket_fees)),
    parking_cost: String(toNumber(concert.parking_cost)),
    food_drink_cost: String(toNumber(concert.food_drink_cost)),
    merchandise_cost: String(toNumber(concert.merchandise_cost)),
    lodging_cost: String(toNumber(concert.lodging_cost)),
    travel_cost: String(toNumber(concert.travel_cost)),
    other_cost: String(toNumber(concert.other_cost)),
    fun_rating: String(toNumber(concert.fun_rating)),
    notes: concert.notes ?? "",
  };
}

function formPayload(form: FormState, fun: number) {
  return {
    concert_name: form.concert_name.trim(),
    artist: form.artist.trim(),
    venue: form.venue.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    concert_date: form.concert_date,
    distance_from_home: n(form.distance_from_home),
    hours_at_event: n(form.hours_at_event),
    ticket_cost: n(form.ticket_cost),
    ticket_fees: n(form.ticket_fees),
    parking_cost: n(form.parking_cost),
    food_drink_cost: n(form.food_drink_cost),
    merchandise_cost: n(form.merchandise_cost),
    lodging_cost: n(form.lodging_cost),
    travel_cost: n(form.travel_cost),
    other_cost: n(form.other_cost),
    fun_rating: fun,
    notes: form.notes.trim() || null,
  };
}

type Props = {
  concert?: Concert;
};

export function ConcertForm({ concert }: Props) {
  const router = useRouter();
  const isEdit = Boolean(concert);
  const [form, setForm] = useState<FormState>(
    concert ? concertToForm(concert) : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const liveTotal = useMemo(
    () =>
      totalCost({
        ticket_cost: n(form.ticket_cost),
        ticket_fees: n(form.ticket_fees),
        parking_cost: n(form.parking_cost),
        food_drink_cost: n(form.food_drink_cost),
        merchandise_cost: n(form.merchandise_cost),
        lodging_cost: n(form.lodging_cost),
        travel_cost: n(form.travel_cost),
        other_cost: n(form.other_cost),
      }),
    [form]
  );

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to save a concert.");
      setSaving(false);
      return;
    }

    const fun = Math.round(n(form.fun_rating));
    if (fun < 1 || fun > 10) {
      setError("Concert rating must be between 1 and 10.");
      setSaving(false);
      return;
    }

    const payload = formPayload(form, fun);

    if (isEdit && concert) {
      const { error: updateError } = await supabase
        .from("concerts")
        .update(payload)
        .eq("id", concert.id)
        .eq("user_id", user.id);

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      router.push("/concerts");
      router.refresh();
      return;
    }

    const { error: insertError } = await supabase.from("concerts").insert({
      user_id: user.id,
      ...payload,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm(emptyForm);
    setSuccess(true);
  }

  const fieldClass =
    "grid grid-cols-[minmax(7.5rem,9.5rem)_1fr] items-center gap-x-3 gap-y-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div role="alert" className="alert alert-success">
          <span>
            {isEdit
              ? "Concert updated!"
              : "Concert saved! Add another whenever you are ready."}
          </span>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Concert details</h2>
          <p className="text-sm text-base-content/60 -mt-2">
            Who played, where you were, and how long the night lasted.
          </p>

          <div className={fieldClass}>
            <label className="label py-0" htmlFor="concert_name">
              <span className="label-text font-medium">Concert name</span>
            </label>
            <input
              id="concert_name"
              className="input input-bordered w-full"
              required
              value={form.concert_name}
              onChange={(e) => update("concert_name", e.target.value)}
              placeholder="Summer Stadium Tour"
            />
          </div>

          <div className={fieldClass}>
            <label className="label py-0" htmlFor="artist">
              <span className="label-text font-medium">Artist or band</span>
            </label>
            <input
              id="artist"
              className="input input-bordered w-full"
              required
              value={form.artist}
              onChange={(e) => update("artist", e.target.value)}
            />
          </div>

          <div className={fieldClass}>
            <label className="label py-0" htmlFor="venue">
              <span className="label-text font-medium">Venue</span>
            </label>
            <input
              id="venue"
              className="input input-bordered w-full"
              required
              value={form.venue}
              onChange={(e) => update("venue", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className="label py-0" htmlFor="city">
                <span className="label-text font-medium">City</span>
              </label>
              <input
                id="city"
                className="input input-bordered w-full"
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className={fieldClass}>
              <label className="label py-0" htmlFor="state">
                <span className="label-text font-medium">State</span>
              </label>
              <input
                id="state"
                className="input input-bordered w-full"
                required
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="TX"
              />
            </div>
          </div>

          <div className={fieldClass}>
            <label className="label py-0" htmlFor="concert_date">
              <span className="label-text font-medium">Concert date</span>
            </label>
            <input
              id="concert_date"
              type="date"
              className="input input-bordered w-full"
              required
              value={form.concert_date}
              onChange={(e) => update("concert_date", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className="label py-0" htmlFor="distance_from_home">
                <span className="label-text font-medium">Miles from home</span>
              </label>
              <input
                id="distance_from_home"
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered w-full"
                value={form.distance_from_home}
                onChange={(e) => update("distance_from_home", e.target.value)}
              />
            </div>
            <div className={fieldClass}>
              <label className="label py-0" htmlFor="hours_at_event">
                <span className="label-text font-medium">Hours at event</span>
              </label>
              <input
                id="hours_at_event"
                type="number"
                min="0"
                step="0.25"
                className="input input-bordered w-full"
                value={form.hours_at_event}
                onChange={(e) => update("hours_at_event", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(7.5rem,9.5rem)_1fr] items-start gap-x-3">
            <label className="label py-0 pt-2" htmlFor="notes">
              <span className="label-text font-medium">Notes</span>
            </label>
            <div>
              <textarea
                id="notes"
                className="textarea textarea-bordered w-full min-h-24"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Optional — favorite song, who you went with…"
              />
              <p className="text-xs text-base-content/50 mt-1">
                Optional. Anything you want to remember later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="card-title text-lg">Costs</h2>
              <p className="text-sm text-base-content/60">
                Enter 0 if you did not spend anything in a category.
              </p>
            </div>
            <div className="badge badge-primary badge-lg gap-1">
              Total: {formatMoney(liveTotal)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["ticket_cost", "Ticket cost"],
                ["ticket_fees", "Ticket fees"],
                ["parking_cost", "Parking cost"],
                ["food_drink_cost", "Food and drink"],
                ["merchandise_cost", "Merchandise"],
                ["lodging_cost", "Hotel / lodging"],
                ["travel_cost", "Travel / gas"],
                ["other_cost", "Other cost"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={fieldClass}>
                <label className="label py-0" htmlFor={key}>
                  <span className="label-text font-medium">{label}</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <span className="opacity-50">$</span>
                  <input
                    id={key}
                    type="number"
                    min="0"
                    step="0.01"
                    className="grow"
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Concert rating</h2>
          <p className="text-sm text-base-content/60 -mt-2">
            How enjoyable was this concert? 1 = Terrible Time, 10 = Best Time
            Ever. This rating is compared with your total spend on the money vs
            enjoyment scale below.
          </p>

          <div className={fieldClass}>
            <label className="label py-0" htmlFor="fun_rating">
              <span className="label-text font-medium">
                Rating ({form.fun_rating}/10)
              </span>
            </label>
            <div>
              <input
                id="fun_rating"
                type="range"
                min="1"
                max="10"
                step="1"
                className="range range-primary"
                value={form.fun_rating}
                onChange={(e) => update("fun_rating", e.target.value)}
              />
              <div className="flex justify-between text-xs text-base-content/60 mt-1 px-1">
                <span>Terrible Time</span>
                <span>Best Time Ever</span>
              </div>
            </div>
          </div>

          <ValueScaleMeter
            concertRating={n(form.fun_rating)}
            totalCost={liveTotal}
          />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        {isEdit && (
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            onClick={() => router.push("/concerts")}
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner" />
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Save concert"
          )}
        </button>
      </div>
    </form>
  );
}
