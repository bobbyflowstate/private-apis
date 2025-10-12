"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHistory } from "@/lib/hooks/use-history";
import { cn } from "@/lib/utils/cn";

const statusFilters = ["all", "success", "failure", "error", "timeout"] as const;

export function ExecutionHistoryTable() {
  const { data, isLoading, isError, error } = useHistory();
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((item) => item.status === filter);
  }, [data, filter]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        Loading history...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/60 bg-red-500/10 p-6 text-sm text-red-200">
        Failed to load history: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Execution history</h2>
          <p className="text-xs text-slate-500">Most recent 50 runs</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {statusFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-3 py-1 capitalize transition",
                filter === item
                  ? "border-brand-400/80 bg-brand-500/10 text-brand-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Request</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">HTTP</th>
              <th className="px-6 py-3 text-left font-medium">Duration</th>
              <th className="px-6 py-3 text-left font-medium">Run at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-900/60">
                <td className="px-6 py-3">
                  <Link
                    href={`/history/${item.id}`}
                    className="font-medium text-slate-200 transition hover:text-brand-200"
                  >
                    {item.request_id}
                  </Link>
                  {item.response_excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.response_excerpt}</p>
                  )}
                  <Link
                    href={`/history/${item.id}`}
                    className="mt-1 hidden text-xs text-brand-400 transition hover:text-brand-300 group-hover:inline-block"
                  >
                    View full details →
                  </Link>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs uppercase",
                      item.status === "success" && "border-emerald-500/60 text-emerald-300",
                      item.status === "failure" && "border-orange-500/60 text-orange-300",
                      item.status === "error" && "border-red-500/60 text-red-300",
                      item.status === "timeout" && "border-yellow-500/60 text-yellow-300"
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {item.http_status ? <span>{item.http_status}</span> : <span className="text-slate-500">—</span>}
                </td>
                <td className="px-6 py-3">
                  {item.duration_ms ? `${item.duration_ms} ms` : <span className="text-slate-500">—</span>}
                </td>
                <td className="px-6 py-3 text-slate-400">
                  {new Date(item.executed_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                  No executions match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
