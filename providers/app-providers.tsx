import type { PropsWithChildren } from "react";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export async function AppProviders({ children }: PropsWithChildren) {
  return (
    <SupabaseProvider>
      <ReactQueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ReactQueryProvider>
    </SupabaseProvider>
  );
}
