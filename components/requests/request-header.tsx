import Link from "next/link";
import { ArrowUpRight, Tag, Edit2, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FullRequest } from "@/lib/types/requests";
import { DuplicateButton } from "./duplicate-button";

interface RequestHeaderProps {
  request: FullRequest;
}

export function RequestHeader({ request }: RequestHeaderProps) {
  const methodClasses = cn(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
    request.method === "GET" && "border-sky-500/60 text-sky-300",
    request.method === "POST" && "border-emerald-500/60 text-emerald-300",
    request.method === "PATCH" && "border-amber-500/60 text-amber-300",
    request.method === "DELETE" && "border-red-500/60 text-red-300",
    request.method === "PUT" && "border-violet-500/60 text-violet-300"
  );

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className={methodClasses}>{request.method}</span>
        {request.api_categories && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800/70 px-2 py-0.5">
            <Tag className="h-3 w-3" /> {request.api_categories.name}
          </span>
        )}
        <span className="font-mono text-[11px] text-slate-500">timeout {request.timeout_ms ?? 10000} ms</span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 break-words">{request.name}</h1>
          {request.description && <p className="max-w-2xl break-words text-sm text-slate-400">{request.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/requests/${request.id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Link>
          <DuplicateButton requestId={request.id} />
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-brand-400 hover:text-brand-200"
          >
            Manage secrets <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-brand-400 hover:text-brand-200"
          >
            View history
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        <p className="font-mono break-all">{request.url}</p>
      </div>
    </header>
  );
}
