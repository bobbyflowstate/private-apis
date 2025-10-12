"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getClientEnv } from "@/lib/config/env";

let client: SupabaseClient<Database> | null = null;

export function getBrowserClient() {
  if (!client) {
    const env = getClientEnv();
    client = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
