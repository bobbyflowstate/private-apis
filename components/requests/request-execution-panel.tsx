"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Play, Loader2, Clipboard } from "lucide-react";
import { ResponseViewer } from "@/components/common/response-viewer";
import { useExecuteRequest } from "@/lib/hooks/use-requests";
import type { FullRequest } from "@/lib/types/requests";
import type { Database } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

interface RuntimeField {
  type: "header" | "queryParam" | "body";
  key: string;
  label: string;
}

type ExecutionStatus = Database["public"]["Enums"]["request_status"];

interface ExecutionResultData {
  success: boolean;
  status: ExecutionStatus;
  executionId?: string;
  httpStatus?: number;
  duration?: number;
  data?: unknown;
  error?: string;
}

const STATUS_CLASSES: Record<ExecutionStatus, string> = {
  success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",
  failure: "border-red-500/60 bg-red-500/10 text-red-300",
  error: "border-red-500/60 bg-red-500/10 text-red-300",
  timeout: "border-amber-500/60 bg-amber-500/10 text-amber-300",
};

function ExecutionResult({ result }: { result: ExecutionResultData }) {
  const badgeClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(badgeClass, "uppercase tracking-wide", STATUS_CLASSES[result.status] ?? STATUS_CLASSES.error)}>
          {result.status}
        </span>
        {/* On timeouts and network errors the edge function reports a made-up status code */}
        {result.httpStatus !== undefined && !result.error && (
          <span className={cn(badgeClass, "font-mono", result.success ? "border-slate-700 text-slate-200" : "border-red-500/60 text-red-300")}>
            HTTP {result.httpStatus}
          </span>
        )}
        {result.duration !== undefined && (
          <span className={cn(badgeClass, "border-slate-700 font-mono font-medium text-slate-300")}>{result.duration} ms</span>
        )}
        {result.executionId && (
          <Link href={`/history/${result.executionId}`} className="ml-auto text-xs text-slate-400 hover:text-slate-200">
            View in history
          </Link>
        )}
      </div>
      {result.error && (
        <p className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-xs text-red-200">{result.error}</p>
      )}
      {result.data !== undefined && result.data !== "" && <ResponseViewer value={result.data} />}
    </div>
  );
}

interface RequestExecutionPanelProps {
  request: FullRequest;
}

export function RequestExecutionPanel({ request }: RequestExecutionPanelProps) {
  const execute = useExecuteRequest();
  const [formState, setFormState] = useState<Record<string, string>>({});

  // Extract runtime fields from request configuration
  const runtimeFields = useMemo((): RuntimeField[] => {
    const fields: RuntimeField[] = [];

    if (request.runtime_prompts?.headers) {
      request.runtime_prompts.headers.forEach((key) => {
        fields.push({ type: "header", key, label: `Header: ${key}` });
      });
    }

    if (request.runtime_prompts?.queryParams) {
      request.runtime_prompts.queryParams.forEach((key) => {
        fields.push({ type: "queryParam", key, label: `Param: ${key}` });
      });
    }

    if (request.runtime_prompts?.body) {
      fields.push({ type: "body", key: "body", label: "Request Body (JSON)" });
    }

    return fields;
  }, [request.runtime_prompts]);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const storageKey = `runtime-values-${request.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setFormState(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, [request.id]);

  // Save to localStorage whenever form state changes
  useEffect(() => {
    const storageKey = `runtime-values-${request.id}`;
    localStorage.setItem(storageKey, JSON.stringify(formState));
  }, [formState, request.id]);

  function handleChange(key: string, value: string) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePaste(fieldKey: string) {
    try {
      const text = await navigator.clipboard.readText();
      handleChange(fieldKey, text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Separate runtime values by type
    const runtimeHeaders: Record<string, string> = {};
    const runtimeQueryParams: Record<string, string> = {};
    let runtimeBody: any = null;

    runtimeFields.forEach((field) => {
      const value = formState[field.key] || "";
      
      if (field.type === "header") {
        runtimeHeaders[field.key] = value;
      } else if (field.type === "queryParam") {
        runtimeQueryParams[field.key] = value;
      } else if (field.type === "body" && value.trim()) {
        try {
          runtimeBody = JSON.parse(value);
        } catch {
          // Keep as string if not valid JSON
          runtimeBody = value;
        }
      }
    });

    // Build payload for Edge Function
    const payload = {
      requestId: request.id,
      parameters: {}, // For placeholder substitution
      ...(Object.keys(runtimeHeaders).length > 0 && { runtimeHeaders }),
      ...(Object.keys(runtimeQueryParams).length > 0 && { runtimeQueryParams }),
      ...(runtimeBody !== null && { runtimeBody }),
    };

    try {
      await execute.mutateAsync(payload);
    } catch {
      // Surfaced through execute.isError below
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">Execute Request</h2>
        <p className="text-xs text-slate-500">
          {runtimeFields.length > 0
            ? "Provide runtime values, then dispatch the request via the secure Supabase Edge Function."
            : "No runtime parameters required. Click to execute the request."}
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3">
          {runtimeFields.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-sm text-slate-400">
              No dynamic parameters configured for this request.
            </p>
          )}

          {runtimeFields.map((field) => (
            <div key={field.key} className="space-y-1 text-sm">
              <label className="flex items-center justify-between text-slate-300" htmlFor={field.key}>
                <span className="font-medium">{field.label}</span>
                <span className="text-xs text-slate-500">runtime</span>
              </label>
              
              <div className="flex flex-col gap-2 sm:flex-row">
                {field.type === "body" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    rows={6}
                    className="min-h-[160px] w-full flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    placeholder='{"key": "value"}'
                    value={formState[field.key] || ""}
                    onChange={(event) => handleChange(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type="text"
                    className="w-full flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={formState[field.key] || ""}
                    onChange={(event) => handleChange(field.key, event.target.value)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => handlePaste(field.key)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-3 w-3" />
                  Paste
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={execute.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {execute.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Run Request
            </>
          )}
        </button>
      </form>

      {execute.isError && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-xs text-red-200">
          {(execute.error as Error)?.message ?? "Failed to invoke Edge Function."}
        </div>
      )}

      {execute.data && <ExecutionResult result={execute.data} />}
    </section>
  );
}
