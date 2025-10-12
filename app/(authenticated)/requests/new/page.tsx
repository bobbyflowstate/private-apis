"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/hooks/use-supabase";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    method: "GET",
    url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to create a request");
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from("api_requests")
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description || null,
          method: formData.method,
          url: formData.url,
          headers: {},
          query_params: {},
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push(`/requests/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create request");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="space-y-2">
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Requests
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Create New Request</h1>
        <p className="text-sm text-slate-400">
          Configure a new API endpoint to execute from your dashboard.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-200">
            Request Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="e.g., Get Weather Data"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-slate-200">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="Brief description of what this request does"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="method" className="text-sm font-medium text-slate-200">
              HTTP Method
            </label>
            <select
              id="method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="url" className="text-sm font-medium text-slate-200">
            URL
          </label>
          <input
            type="url"
            id="url"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="https://api.example.com/endpoint"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Request"}
          </button>
          <Link
            href="/requests"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

