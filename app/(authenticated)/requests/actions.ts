"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { getServerClient } from "@/lib/supabase/server-client";

export async function setRequestFavorite(requestId: string, isFavorite: boolean) {
  const user = await requireAuth();
  const supabase = getServerClient();

  const { error } = await supabase
    .from("api_requests")
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Failed to update favorite state:", error);
    throw new Error("Failed to update favorite state");
  }

  revalidatePath("/requests");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/requests/${requestId}`);
}
