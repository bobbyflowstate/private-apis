import type { Database } from "@/lib/types/database";
import { getServerClient } from "@/lib/supabase/server-client";
import type { FullRequest } from "@/lib/types/requests";

export type ApiRequest = Database["public"]["Tables"]["api_requests"]["Row"];
export type ApiCategory = Database["public"]["Tables"]["api_categories"]["Row"];
export type RequestExecution = Database["public"]["Tables"]["request_executions"]["Row"];

export async function fetchApiRequests() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("api_requests")
    .select("*, api_categories(name, icon, sort_order)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("fetchApiRequests error", error.message);
    throw error;
  }

  return data;
}

export async function fetchRequestById(id: string): Promise<FullRequest> {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("api_requests")
    .select("*, request_parameters(*), api_categories(name, icon)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("fetchRequestById error", error.message);
    throw error;
  }

  return data;
}

export async function fetchExecutionsForRequest(id: string, limit = 20) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("request_executions")
    .select("*")
    .eq("request_id", id)
    .order("executed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchExecutionsForRequest error", error.message);
    throw error;
  }

  return data;
}
