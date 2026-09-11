import { redirect } from "next/navigation";
import { getAuthStatus } from "@/lib/auth/get-user";

/**
 * Ensures the user is authenticated. Redirects to sign-in if not.
 * @returns The authenticated user object
 */
export async function requireAuth() {
  const { user, unreachable } = await getAuthStatus();

  if (!user) {
    // Their session may well be valid -- we just couldn't check it. Carry the
    // reason through so the sign-in page can explain instead of implying they
    // were logged out.
    redirect(unreachable ? "/auth/sign-in?error=auth_unavailable" : "/auth/sign-in");
  }

  return user;
}
