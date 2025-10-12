import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/get-user";

/**
 * Ensures the user is authenticated. Redirects to sign-in if not.
 * @returns The authenticated user object
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}
