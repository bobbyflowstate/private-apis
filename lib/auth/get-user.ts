import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server-client";
import { isSupabaseUnreachable } from "@/lib/supabase/fetch-with-timeout";

export type AuthStatus = {
  user: User | null;
  /**
   * True when Supabase itself couldn't be reached (paused project, network
   * failure), as opposed to the visitor simply not being signed in. Callers
   * should say so rather than claiming the visitor is logged out.
   */
  unreachable: boolean;
};

/**
 * Gets the authenticated user from Supabase, along with whether the auth
 * server was reachable at all.
 * Uses getUser() which validates the session with the auth server (more secure than getSession()).
 */
export const getAuthStatus = cache(async (): Promise<AuthStatus> => {
  const supabase = getServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Failed to fetch user", error.message);
      return { user: null, unreachable: isSupabaseUnreachable(error) };
    }

    return { user, unreachable: false };
  } catch (error) {
    console.error("Failed to fetch user", error);
    return { user: null, unreachable: true };
  }
});

export const getAuthenticatedUser = cache(async () => {
  const { user } = await getAuthStatus();
  return user;
});
