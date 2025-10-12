"use client";

import { MoonStar, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/hooks/use-supabase";
import { useTheme } from "@/providers/theme-provider";
import { useUIStore } from "@/store/ui-store";

interface TopBarProps {
  email: string;
}

export function TopBar({ email }: TopBarProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const { theme } = useTheme();
  const setTheme = useUIStore((state) => state.setTheme);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out failed", error.message);
      setSigningOut(false);
      return;
    }
    router.push("/auth/sign-in");
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 hidden h-[57px] items-center justify-between border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 lg:flex" />
    );
  }

  return (
    <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 lg:flex">
      <div className="text-sm text-slate-400">
        <span className="font-medium text-slate-200">Welcome back,</span> {email}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 transition hover:border-slate-500"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
