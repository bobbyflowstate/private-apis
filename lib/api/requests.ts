import { getServerClient } from "@/lib/supabase/server-client";
import type { FullRequest } from "@/lib/types/requests";

export async function fetchApiRequests() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("api_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch API requests:", error);
    return null;
  }

  return data;
}

export async function fetchApiRequestById(id: string): Promise<FullRequest | null> {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("api_requests")
    .select("*, request_parameters(*), api_categories(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch API request:", error);
    return null;
  }

  return data as FullRequest;
}

export async function duplicateApiRequest(id: string, ownerId: string): Promise<string | null> {
  const supabase = getServerClient();
  
  // Fetch the original request
  const { data: original, error: fetchError } = await supabase
    .from("api_requests")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single();

  if (fetchError || !original) {
    console.error("Failed to fetch original request:", fetchError);
    return null;
  }

  // Create a duplicate with modified name
  const { data: duplicate, error: insertError } = await supabase
    .from("api_requests")
    .insert({
      owner_id: ownerId,
      category_id: original.category_id,
      name: `${original.name} (Copy)`,
      description: original.description,
      method: original.method,
      url: original.url,
      headers: original.headers,
      query_params: original.query_params,
      body_template: original.body_template,
      timeout_ms: original.timeout_ms,
      secret_bindings: original.secret_bindings,
      requires_confirmation: original.requires_confirmation,
      runtime_prompts: original.runtime_prompts,
    })
    .select("id")
    .single();

  if (insertError || !duplicate) {
    console.error("Failed to create duplicate:", insertError);
    return null;
  }

  return duplicate.id;
}
