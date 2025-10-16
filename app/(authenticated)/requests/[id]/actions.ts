"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { duplicateApiRequest } from "@/lib/api/requests";

export async function duplicateRequest(requestId: string) {
  const user = await requireAuth();
  
  const duplicateId = await duplicateApiRequest(requestId, user.id);
  
  if (!duplicateId) {
    throw new Error("Failed to duplicate request");
  }
  
  // Revalidate the requests list
  revalidatePath("/requests");
  
  // Redirect to edit page for the duplicate
  redirect(`/requests/${duplicateId}/edit`);
}


