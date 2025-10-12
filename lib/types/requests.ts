import type { Database } from "@/lib/types/database";

export type RequestRow = Database["public"]["Tables"]["api_requests"]["Row"];
export type RequestParameterRow = Database["public"]["Tables"]["request_parameters"]["Row"];
export type RequestExecutionRow = Database["public"]["Tables"]["request_executions"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["api_categories"]["Row"];

export interface FullRequest extends RequestRow {
  request_parameters?: RequestParameterRow[];
  request_executions?: RequestExecutionRow[];
  api_categories?: CategoryRow | null;
}
