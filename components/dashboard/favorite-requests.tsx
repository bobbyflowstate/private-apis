import Link from "next/link";
import { fetchApiRequests } from "@/lib/api/requests";
import { cn } from "@/lib/utils/cn";
import { PlusIcon } from "lucide-react";

export async function FavoriteRequests() {
  const requests = await fetchApiRequests();
  const items = (requests ?? []).slice(0, 6);

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
        <p className="text-sm text-slate-400">No requests yet. Create your first API request to get started.</p>
        <Link
          href="/requests/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
        >
          <PlusIcon className="h-4 w-4" />
          Create Request
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Quick launch</h2>
          <p className="text-xs text-slate-500">Your most recently updated requests</p>
        </div>
        <Link className="text-xs text-brand-300 hover:text-brand-200" href="/settings">
          Manage
        </Link>
      </header>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((request) => {
          const lastUpdated = request.updated_at ?? request.created_at ?? new Date().toISOString();
          return (
            <Link
              key={request.id}
              href={`/requests/${request.id}`}
              className="group rounded-lg border border-slate-800/70 bg-slate-900/50 p-4 transition hover:border-brand-400/60 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className={cn(
                  "rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                  request.method === "POST" && "border-emerald-500/60 text-emerald-300",
                  request.method === "GET" && "border-sky-500/60 text-sky-300",
                  request.method === "DELETE" && "border-red-500/60 text-red-300"
                )}>
                  {request.method}
                </span>
                <span>{new Date(lastUpdated).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-100">{request.name}</h3>
              {request.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{request.description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
