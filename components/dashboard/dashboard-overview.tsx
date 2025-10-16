import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/api/dashboard";

const metricConfig: Array<{
  key: keyof DashboardMetrics;
  label: string;
  helper: string;
}> = [
  {
    key: "totalRequests",
    label: "Saved Requests",
    helper: "Configured API calls ready to run",
  },
  {
    key: "totalCategories",
    label: "Categories",
    helper: "Groups for organising workflows",
  },
  {
    key: "recentExecutions",
    label: "Recent Executions",
    helper: "Tracked in the last 50 runs",
  },
];

export async function DashboardOverview() {
  const metrics = await fetchDashboardMetrics();

  return (
    <section>
      {/* Hidden on mobile for a cleaner, task-focused dashboard */}
      <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:grid">
        {metricConfig.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-100">{metrics[item.key] ?? 0}</p>
            <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
          </div>
        ))}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Success rate</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {metrics.successRate !== null ? `${Math.round(metrics.successRate * 100)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across the last 50 executions</p>
        </div>
      </div>

      {/* Compact collapsible insights on mobile */}
      <details className="md:hidden">
        <summary className="cursor-pointer select-none rounded-lg border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          Insights
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {metricConfig.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="text-xl font-semibold text-slate-100">{metrics[item.key] ?? 0}</p>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{item.helper}</p>
            </div>
          ))}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Success rate</p>
              <p className="text-xl font-semibold text-slate-100">
                {metrics.successRate !== null ? `${Math.round(metrics.successRate * 100)}%` : "—"}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Across the last 50 executions</p>
          </div>
        </div>
      </details>
    </section>
  );
}
