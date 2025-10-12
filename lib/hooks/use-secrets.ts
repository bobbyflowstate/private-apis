"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/lib/hooks/use-supabase";

export function useSecrets() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["secrets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_metadata")
        .select("alias, description, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}
