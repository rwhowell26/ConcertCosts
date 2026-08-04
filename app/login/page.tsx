import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/40"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(70% 0.2 300 / 0.35), transparent 40%), radial-gradient(circle at 80% 10%, oklch(75% 0.18 200 / 0.3), transparent 35%), radial-gradient(circle at 50% 80%, oklch(65% 0.15 30 / 0.25), transparent 45%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-xl text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/80 mb-3">
            Your shows. Your spend. Your story.
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight drop-shadow-sm">
            Concert Cost Tracker
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-base-content/80 max-w-md mx-auto lg:mx-0">
            Remember every night out — tickets, snacks, merch, and how much fun
            it really was.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
