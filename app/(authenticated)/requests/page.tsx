import Link from "next/link";
import { Suspense } from "react";
import { fetchApiRequests } from "@/lib/api/requests";
import { PlusIcon } from "lucide-react";

async function RequestsList() {
  const requests = await fetchApiRequests();

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
        <div className="mx-auto w-fit rounded-full bg-slate-800/60 p-4">
          <PlusIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-100">No API requests yet</h3>
        <p className="mt-2 text-sm text-slate-400">
          Get started by creating your first API request configuration.
        </p>
        <Link
          href="/requests/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
        >
          <PlusIcon className="h-4 w-4" />
          Create Request
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Link
          key={request.id}
          href={`/requests/${request.id}`}
          className="group flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/50 p-4 transition hover:border-brand-400/60 hover:bg-slate-900"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${
                  request.method === "GET"
                    ? "border-sky-500/60 text-sky-300"
                    : request.method === "POST"
                    ? "border-emerald-500/60 text-emerald-300"
                    : request.method === "PUT"
                    ? "border-amber-500/60 text-amber-300"
                    : request.method === "DELETE"
                    ? "border-red-500/60 text-red-300"
                    : "border-slate-700 text-slate-300"
                }`}
              >
                {request.method}
              </span>
              <h3 className="text-base font-semibold text-slate-100">{request.name}</h3>
            </div>
            {request.description && (
              <p className="mt-1 text-sm text-slate-400">{request.description}</p>
            )}
            <p className="mt-2 font-mono text-xs text-slate-500">{request.url}</p>
          </div>
          <div className="text-sm text-slate-500">
            {request.updated_at
              ? new Date(request.updated_at).toLocaleDateString()
              : new Date(request.created_at).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function RequestsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">API Requests</h1>
          <p className="text-sm text-slate-400">
            Manage your saved API request configurations.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
        >
          <PlusIcon className="h-4 w-4" />
          New Request
        </Link>
      </header>
      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            Loading requests...
          </div>
        }
      >
        <RequestsList />
      </Suspense>
    </div>
  );
}

