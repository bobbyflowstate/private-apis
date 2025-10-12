import { getServerClient } from "@/lib/supabase/server-client";

export interface DashboardMetrics {
  totalRequests: number;
  totalCategories: number;
  recentExecutions: number;
  successRate: number | null;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getServerClient();

  const [requests, categories, executions] = await Promise.all([
    supabase.from("api_requests").select("id", { count: "exact", head: true }),
    supabase.from("api_categories").select("id", { count: "exact", head: true }),
    supabase
      .from("request_executions")
      .select("status", { count: "exact" })
      .order("executed_at", { ascending: false })
      .limit(50),
  ]);

  if (requests.error) {
    throw requests.error;
  }

  if (categories.error) {
    throw categories.error;
  }

  if (executions.error) {
    throw executions.error;
  }

  const totalRequests = requests.count ?? 0;
  const totalCategories = categories.count ?? 0;
  const recentExecutions = executions.data?.length ?? 0;
  const successRate = executions.data && executions.data.length > 0
    ? executions.data.filter((item) => item.status === "success").length / executions.data.length
    : null;

  return {
    totalRequests,
    totalCategories,
    recentExecutions,
    successRate,
  };
}
