"use client";

import { useState, useMemo } from "react";
import { Play, Loader2 } from "lucide-react";
import { useExecuteRequest } from "@/lib/hooks/use-requests";
import type { RequestParameterRow } from "@/lib/types/requests";
import type { Json } from "@/lib/types/database";

interface RequestExecutionPanelProps {
  requestId: string;
  parameters: RequestParameterRow[];
}

export function RequestExecutionPanel({ requestId, parameters }: RequestExecutionPanelProps) {
  const execute = useExecuteRequest();
  const [formState, setFormState] = useState<Record<string, Json>>(() => {
    const defaults: Record<string, Json> = {};
    for (const parameter of parameters) {
      if (parameter.default_value !== null && parameter.default_value !== undefined) {
        defaults[parameter.key] = parameter.default_value;
      }
    }
    return defaults;
  });

  const sortedParameters = useMemo(
    () => [...parameters].sort((a, b) => a.key.localeCompare(b.key)),
    [parameters]
  );

  function handleChange(key: string, value: string) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await execute.mutateAsync({
      requestId,
      parameters: formState,
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">Execute request</h2>
        <p className="text-xs text-slate-500">
          Provide any runtime parameters, then dispatch the request via the secure Supabase Edge Function.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3">
          {sortedParameters.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-sm text-slate-400">
              No dynamic parameters required for this request.
            </p>
          )}
          {sortedParameters.map((parameter) => (
            <div key={parameter.id} className="space-y-1 text-sm">
              <label className="flex items-center justify-between text-slate-300" htmlFor={parameter.key}>
                <span className="font-medium">{parameter.key}</span>
                <span className="text-xs text-slate-500">
                  {parameter.type} {parameter.required ? "• required" : ""}
                </span>
              </label>
              <input
                id={parameter.key}
                name={parameter.key}
                required={parameter.required}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder={String(parameter.default_value ?? "")}
                value={String(formState[parameter.key] ?? "")}
                onChange={(event) => handleChange(parameter.key, event.target.value)}
              />
              {parameter.config && (
                <p className="text-xs text-slate-500">{JSON.stringify(parameter.config)}</p>
              )}
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
              <Play className="h-4 w-4" /> Run request
            </>
          )}
        </button>
      </form>
      {execute.isError && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-xs text-red-200">
          {(execute.error as Error)?.message ?? "Failed to invoke Edge Function."}
        </div>
      )}
      {execute.data && (
        <div className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 p-3 text-xs text-emerald-100">
          <p className="font-semibold">Response preview</p>
          <pre className="mt-2 max-h-48 overflow-auto text-[11px]">
            {JSON.stringify(execute.data, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
