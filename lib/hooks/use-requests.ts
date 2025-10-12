"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/hooks/use-supabase";
import type { Database } from "@/lib/types/database";
import type { Json } from "@/lib/types/database";

export function useRequests() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_requests")
        .select("id, name, description, method, updated_at, category_id, requires_confirmation")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useRequestDetail(id?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["request", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("api_requests")
        .select("*, request_parameters(*), api_categories(id, name, icon), request_executions(*)")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

export function useExecuteRequest() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      requestId: string;
      parameters: Record<string, Json>;
    }) => {
      const { data, error } = await supabase.functions.invoke("execute_request", {
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["request", variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
