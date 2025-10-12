"use client";

import { getBrowserClient } from "@/lib/supabase/browser-client";

export function useSupabase() {
  return getBrowserClient();
}
