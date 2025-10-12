"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/hooks/use-supabase";

export function useHistory() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_executions")
        .select("id, request_id, status, http_status, duration_ms, executed_at, response_excerpt")
        .order("executed_at", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}
