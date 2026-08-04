"use client";

import { THEMES, useTheme, type ThemeName } from "@/components/ThemeProvider";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ThemeSelector({ className = "", compact = false }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      {!compact && (
        <span className="text-sm font-medium whitespace-nowrap">Theme</span>
      )}
      <select
        className="select select-bordered select-sm w-full max-w-[11rem]"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        aria-label="Choose app theme"
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
