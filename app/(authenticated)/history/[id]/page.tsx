import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { cn } from "@/lib/utils/cn";

interface ExecutionDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ExecutionDetailPage({ params }: ExecutionDetailPageProps) {
  await requireAuth();
  const supabase = getServerClient();

  // Fetch execution with related request info
  const { data: execution, error } = await supabase
    .from("request_executions")
    .select(`
      *,
      api_requests (
        id,
        name,
        method,
        url
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !execution) {
    notFound();
  }

  const request = execution.api_requests as any;

  // Format response body for display
  let formattedResponseBody = execution.response_body || "";
  try {
    if (formattedResponseBody) {
      const parsed = JSON.parse(formattedResponseBody);
      formattedResponseBody = JSON.stringify(parsed, null, 2);
    }
  } catch {
    // Keep as-is if not JSON
  }

  // Format request body for display
  let formattedRequestBody = execution.request_body || "";
  try {
    if (formattedRequestBody) {
      const parsed = JSON.parse(formattedRequestBody);
      formattedRequestBody = JSON.stringify(parsed, null, 2);
    }
  } catch {
    // Keep as-is if not JSON
  }

  // Status styling
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/60",
    },
    failure: {
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/60",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/60",
    },
    timeout: {
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/60",
    },
  };

  const config = statusConfig[execution.status];
  const StatusIcon = config.icon;

  // Method styling
  const methodClasses = cn(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
    request.method === "GET" && "border-sky-500/60 text-sky-300",
    request.method === "POST" && "border-emerald-500/60 text-emerald-300",
    request.method === "PATCH" && "border-amber-500/60 text-amber-300",
    request.method === "DELETE" && "border-red-500/60 text-red-300",
    request.method === "PUT" && "border-violet-500/60 text-violet-300"
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to History
          </Link>
          <Link
            href={`/requests/${request.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
          >
            View Request
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Execution Details</h1>
          <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium", config.bg, config.border, config.color)}>
            <StatusIcon className="h-4 w-4" />
            {execution.status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Overview Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Request</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Name:</span>{" "}
                <span className="text-slate-200">{request.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Method:</span>{" "}
                <span className={methodClasses}>{request.method}</span>
              </div>
              <div>
                <span className="text-slate-500">Executed:</span>{" "}
                <span className="text-slate-200">
                  {new Date(execution.executed_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Response</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Status Code:</span>{" "}
                <span className={cn("font-medium", execution.http_status && execution.http_status >= 200 && execution.http_status < 300 ? "text-emerald-400" : "text-red-400")}>
                  {execution.http_status || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Duration:</span>{" "}
                <span className="text-slate-200">{execution.duration_ms || 0} ms</span>
              </div>
              {execution.error_message && (
                <div>
                  <span className="text-slate-500">Error:</span>{" "}
                  <span className="text-red-400">{execution.error_message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Request Details</h2>
        
        {/* URL */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-300">URL</h3>
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
            <code className="break-all text-xs text-slate-300">{execution.final_url || request.url}</code>
          </div>
        </div>

        {/* Request Headers */}
        {execution.request_headers && Object.keys(execution.request_headers as Record<string, string>).length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">Request Headers</h3>
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
              <pre className="text-xs text-slate-300">
                {JSON.stringify(execution.request_headers, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Request Body */}
        {execution.request_body && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">Request Body</h3>
            <div className="max-h-96 overflow-auto rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
              <pre className="text-xs text-slate-300">{formattedRequestBody}</pre>
            </div>
          </div>
        )}

        {/* Parameters Used */}
        {execution.parameters_used && Object.keys(execution.parameters_used as Record<string, any>).length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">Runtime Parameters</h3>
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
              <pre className="text-xs text-slate-300">
                {JSON.stringify(execution.parameters_used, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Response Details */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Response Details</h2>

        {/* Response Headers */}
        {execution.response_headers && Object.keys(execution.response_headers as Record<string, string>).length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">Response Headers</h3>
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
              <pre className="text-xs text-slate-300">
                {JSON.stringify(execution.response_headers, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Response Body */}
        {execution.response_body && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-300">
              Response Body
              {execution.response_body.includes("[Response truncated]") && (
                <span className="ml-2 text-xs font-normal text-amber-400">(truncated to 100KB)</span>
              )}
            </h3>
            <div className="max-h-96 overflow-auto rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3">
              <pre className="text-xs text-slate-300">{formattedResponseBody}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

