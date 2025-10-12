import { getServerClient } from "@/lib/supabase/server-client";

export async function fetchRecentExecutions(limit = 10) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("request_executions")
    .select("id, request_id, status, http_status, duration_ms, executed_at, response_excerpt")
    .order("executed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchRecentExecutions error", error.message);
    throw error;
  }

  return data ?? [];
}
