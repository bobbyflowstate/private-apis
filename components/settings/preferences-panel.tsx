"use client";

import { useMemo } from "react";
import { useUIStore } from "@/store/ui-store";

const themeOptions = [
  { value: "system", label: "Match system" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const;

export function PreferencesPanel() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const options = useMemo(() => themeOptions, []);

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">Preferences</h2>
        <p className="text-xs text-slate-500">Client-side options stored securely in local storage.</p>
      </header>
      <div className="space-y-2 text-sm">
        <p className="font-medium text-slate-200">Theme</p>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2"
            >
              <span>{option.label}</span>
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => setTheme(option.value)}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-3 text-xs text-slate-500">
        <p>Sidebar state and theme preference sync across devices via Supabase profile in future iterations.</p>
      </div>
    </section>
  );
}
