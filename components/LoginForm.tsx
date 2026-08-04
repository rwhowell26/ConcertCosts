"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function goToApp() {
    // Full page load so auth cookies are sent to the server on Vercel.
    window.location.assign("/dashboard");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (signUpData.session) {
          goToApp();
          return;
        }

        const { error: signInAfterSignUpError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (!signInAfterSignUpError) {
          goToApp();
          return;
        }

        setMessage(
          "Account created, but email confirmation may still be required in Supabase. Turn off Confirm email, then log in."
        );
        setMode("login");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      goToApp();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldRow =
    "grid grid-cols-[6.5rem_1fr] sm:grid-cols-[7.5rem_1fr] items-center gap-x-3";

  return (
    <div className="card bg-base-100/95 shadow-2xl border border-base-300 w-full max-w-md backdrop-blur">
      <div className="card-body gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="card-title text-2xl">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-base-content/70 mt-1">
              {mode === "login"
                ? "Log in to see your concerts and spending."
                : "Sign up free — your concerts stay private to you."}
            </p>
          </div>
          <ThemeSelector compact />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={fieldRow}>
            <label className="label py-0 justify-self-start" htmlFor="email">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className={fieldRow}>
            <label className="label py-0 justify-self-start" htmlFor="password">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div role="alert" className="alert alert-success text-sm py-2">
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : mode === "login" ? (
              "Log in"
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-base-content/70">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                className="link link-primary font-medium"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link link-primary font-medium"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
