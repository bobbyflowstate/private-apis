import Link from "next/link";
import { fetchRecentExecutions } from "@/lib/api/history";
import { cn } from "@/lib/utils/cn";

const statusColors: Record<string, string> = {
  success: "text-emerald-300 border-emerald-500/60",
  failure: "text-orange-300 border-orange-500/60",
  error: "text-red-300 border-red-500/60",
  timeout: "text-yellow-300 border-yellow-500/60",
};

export async function RecentExecutions() {
  const executions = await fetchRecentExecutions(8);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Recent executions</h2>
          <p className="text-xs text-slate-500">Last {executions.length} tracked requests</p>
        </div>
        <Link className="text-xs text-brand-300 hover:text-brand-200" href="/history">
          View all
        </Link>
      </header>
      <div className="mt-4 space-y-3">
        {executions.length === 0 && (
          <p className="text-sm text-slate-400">No executions logged yet.</p>
        )}
        {executions.map((execution) => (
          <Link
            key={execution.id}
            href={`/requests/${execution.request_id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-900/50 px-3 py-2 text-sm transition hover:border-brand-400/60 hover:bg-slate-900"
          >
            <div className="flex flex-col">
              <span className="font-mono text-xs text-slate-500">
                {new Date(execution.executed_at).toLocaleString()}
              </span>
              <span className="text-slate-200">{execution.request_id}</span>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs uppercase",
                statusColors[execution.status] ?? "border-slate-700 text-slate-400"
              )}
            >
              {execution.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
