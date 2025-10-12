"use client";

import type { PropsWithChildren } from "react";
import { getBrowserClient } from "@/lib/supabase/browser-client";

export function SupabaseProvider({ children }: PropsWithChildren) {
  // Initialize the client on mount
  getBrowserClient();

  return <>{children}</>;
}
