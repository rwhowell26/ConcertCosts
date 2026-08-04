"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/add-concert", label: "Add Concert" },
  { href: "/concerts", label: "My Concerts" },
  { href: "/artists", label: "Artists" },
];

type Props = {
  email: string;
};

export function AppHeader({ email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-base-300 bg-base-100/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
              Concert Cost Tracker
            </h1>
            <p className="text-sm text-base-content/70 mt-1 max-w-xl">
              Log shows, track what you spent, and see which nights were worth
              every dollar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ThemeSelector />
            <div className="badge badge-outline badge-lg max-w-[14rem] truncate">
              {email}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>

        <nav className="tabs tabs-box bg-base-200 p-1 w-full sm:w-fit">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tab flex-1 sm:flex-none ${active ? "tab-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
