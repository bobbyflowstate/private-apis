import { cache } from "react";
import { getServerClient } from "@/lib/supabase/server-client";

/**
 * Gets the authenticated user from Supabase.
 * Uses getUser() which validates the session with the auth server (more secure than getSession()).
 */
export const getAuthenticatedUser = cache(async () => {
  const supabase = getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to fetch user", error.message);
    return null;
  }

  return user;
});
