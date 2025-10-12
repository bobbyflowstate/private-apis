"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useUIStore } from "@/store/ui-store";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark" });

function resolveTheme(preference: "light" | "dark" | "system"): ResolvedTheme {
  if (preference === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  }
  return preference;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useUIStore((state) => state.theme);
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(preference));

  useEffect(() => {
    const next = resolveTheme(preference);
    setTheme(next);
    if (typeof document !== "undefined") {
      document.body.classList.remove("light", "dark");
      document.body.classList.add(next);
    }
  }, [preference]);

  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const next: ResolvedTheme = mediaQuery.matches ? "dark" : "light";
      setTheme(next);
      document.body.classList.remove("light", "dark");
      document.body.classList.add(next);
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [preference]);

  const value = useMemo(() => ({ theme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
