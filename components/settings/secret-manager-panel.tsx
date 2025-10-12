"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { useSecrets } from "@/lib/hooks/use-secrets";

export function SecretManagerPanel() {
  const { data, isLoading, isError, error } = useSecrets();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Secrets vault</h2>
          <p className="text-xs text-slate-500">Aliases mapped to Supabase Vault entries</p>
        </div>
        <button
          type="button"
          onClick={() => setShowHelper(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-brand-400 hover:text-brand-200"
        >
          <Plus className="h-4 w-4" /> New secret
        </button>
      </header>
      {showHelper && (
        <div className="rounded-lg border border-brand-500/50 bg-brand-500/10 p-4 text-xs text-brand-100">
          <p>
            Secrets are stored securely in Supabase Vault. Use the Supabase dashboard or CLI to insert the
            actual value, then link it here by alias.
          </p>
          <button
            type="button"
            className="mt-2 text-brand-200 underline"
            onClick={() => setShowHelper(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      {isLoading && <p className="text-sm text-slate-400">Loading secrets...</p>}
      {isError && (
        <p className="text-sm text-red-300">
          Failed to load secrets: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
      <ul className="space-y-3 text-sm">
        {(data ?? []).map((secret) => (
          <li
            key={secret.alias}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2"
          >
            <div>
              <p className="font-medium text-slate-200">{secret.alias}</p>
              {secret.description && <p className="text-xs text-slate-500">{secret.description}</p>}
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Updated {secret.updated_at ? new Date(secret.updated_at).toLocaleString() : "—"}</p>
              <p className="inline-flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> Vault secured
              </p>
            </div>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && !isLoading && !isError && (
          <li className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">
            No secrets linked yet.
          </li>
        )}
      </ul>
    </section>
  );
}
