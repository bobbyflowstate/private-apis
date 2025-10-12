"use client";

import { useState } from "react";
import { ShieldCheck, Plus, XIcon, Trash2 } from "lucide-react";
import { useSecrets } from "@/lib/hooks/use-secrets";
import { useSupabase } from "@/lib/hooks/use-supabase";

export function SecretManagerPanel() {
  const { data, isLoading, isError, error, refetch } = useSecrets();
  const supabase = useSupabase();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    alias: "",
    value: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFormError("You must be logged in");
        setSubmitting(false);
        return;
      }

      // Store the secret in Vault
      const { data: vaultId, error: vaultError } = await supabase
        .rpc("store_secret", {
          secret_name: formData.alias,
          secret_value: formData.value,
        });

      if (vaultError) {
        setFormError(`Failed to store secret: ${vaultError.message}`);
        setSubmitting(false);
        return;
      }

      // Store metadata
      const { error: metaError } = await supabase
        .from("secret_metadata")
        .insert({
          alias: formData.alias,
          owner_id: user.id,
          vault_id: vaultId,
          description: formData.description || null,
        });

      if (metaError) {
        setFormError(`Failed to store metadata: ${metaError.message}`);
        setSubmitting(false);
        return;
      }

      // Reset form
      setFormData({ alias: "", value: "", description: "" });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add secret");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(alias: string) {
    if (!confirm(`Are you sure you want to delete the secret "${alias}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("secret_metadata")
        .delete()
        .eq("alias", alias);

      if (error) {
        alert(`Failed to delete secret: ${error.message}`);
        return;
      }

      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete secret");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Secrets Vault</h2>
          <p className="text-xs text-slate-500">
            Store API keys and tokens securely. Reference them in requests with{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5">{"{{SECRET_NAME}}"}</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-400"
        >
          <Plus className="h-4 w-4" /> Add Secret
        </button>
      </header>

      {/* Add Secret Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">New Secret</h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormError(null);
                setFormData({ alias: "", value: "", description: "" });
              }}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label htmlFor="alias" className="text-xs font-medium text-slate-200">
              Secret Name (Alias) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="alias"
              required
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="e.g., API_KEY, OAUTH_TOKEN"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use UPPERCASE_WITH_UNDERSCORES. This is how you'll reference it in requests.
            </p>
          </div>

          <div>
            <label htmlFor="value" className="text-xs font-medium text-slate-200">
              Secret Value <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              id="value"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="Enter the secret value"
            />
            <p className="mt-1 text-xs text-slate-500">This will be encrypted and stored in Supabase Vault.</p>
          </div>

          <div>
            <label htmlFor="description" className="text-xs font-medium text-slate-200">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="e.g., Production API key for weather service"
            />
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-xs text-red-200">
              {formError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Secret"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormError(null);
                setFormData({ alias: "", value: "", description: "" });
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading/Error States */}
      {isLoading && <p className="text-sm text-slate-400">Loading secrets...</p>}
      {isError && (
        <p className="text-sm text-red-300">
          Failed to load secrets: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {/* Secrets List */}
      <ul className="space-y-2">
        {(data ?? []).map((secret) => (
          <li
            key={secret.alias}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-900/40 px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-mono text-sm font-medium text-slate-200">{secret.alias}</p>
              {secret.description && <p className="text-xs text-slate-500">{secret.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-slate-500">
                <p className="inline-flex items-center gap-1 text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> Encrypted
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(secret.alias)}
                className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-red-500 hover:text-red-400"
                title="Delete secret"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && !isLoading && !isError && (
          <li className="rounded-lg border border-dashed border-slate-700 px-3 py-8 text-center text-sm text-slate-500">
            <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p>No secrets stored yet.</p>
            <p className="text-xs">Click "Add Secret" to securely store your API keys and tokens.</p>
          </li>
        )}
      </ul>
    </section>
  );
}
