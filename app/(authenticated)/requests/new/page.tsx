"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/hooks/use-supabase";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

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
    timeout_ms: "10000",
  });

  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { id: crypto.randomUUID(), key: "", value: "" }
  ]);
  
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([
    { id: crypto.randomUUID(), key: "", value: "" }
  ]);
  
  const [body, setBody] = useState("");

  // Helper functions for key-value pairs
  function addHeader() {
    setHeaders([...headers, { id: crypto.randomUUID(), key: "", value: "" }]);
  }

  function updateHeader(id: string, field: "key" | "value", value: string) {
    setHeaders(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  }

  function removeHeader(id: string) {
    setHeaders(headers.filter((h) => h.id !== id));
  }

  function addQueryParam() {
    setQueryParams([...queryParams, { id: crypto.randomUUID(), key: "", value: "" }]);
  }

  function updateQueryParam(id: string, field: "key" | "value", value: string) {
    setQueryParams(queryParams.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }

  function removeQueryParam(id: string) {
    setQueryParams(queryParams.filter((q) => q.id !== id));
  }

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

      // Convert headers array to object
      const headersObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      // Convert query params array to object
      const queryParamsObj: Record<string, string> = {};
      queryParams.forEach((q) => {
        if (q.key && q.value) {
          queryParamsObj[q.key] = q.value;
        }
      });

      // Parse body as JSON if provided
      let bodyTemplate = null;
      if (body.trim() && formData.method !== "GET") {
        try {
          bodyTemplate = JSON.parse(body);
        } catch {
          setError("Body must be valid JSON");
          setLoading(false);
          return;
        }
      }

      const { data, error: insertError } = await supabase
        .from("api_requests")
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description || null,
          method: formData.method,
          url: formData.url,
          timeout_ms: parseInt(formData.timeout_ms, 10),
          headers: Object.keys(headersObj).length > 0 ? headersObj : null,
          query_params: Object.keys(queryParamsObj).length > 0 ? queryParamsObj : null,
          body_template: bodyTemplate,
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Basic Information</h2>
          
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-200">
              Request Name <span className="text-red-400">*</span>
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
              Description
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
                HTTP Method <span className="text-red-400">*</span>
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
            
            <div>
              <label htmlFor="timeout" className="text-sm font-medium text-slate-200">
                Timeout (ms)
              </label>
              <input
                type="number"
                id="timeout"
                value={formData.timeout_ms}
                onChange={(e) => setFormData({ ...formData, timeout_ms: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                min="1000"
                max="60000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="url" className="text-sm font-medium text-slate-200">
              URL <span className="text-red-400">*</span>
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
            <p className="mt-1 text-xs text-slate-500">
              Tip: Use {"{{"} paramName {"}"} for dynamic values
            </p>
          </div>
        </div>

        {/* Headers Section */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Headers</h2>
            <button
              type="button"
              onClick={addHeader}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              <PlusIcon className="h-3 w-3" />
              Add Header
            </button>
          </div>
          
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={header.id} className="flex gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, "key", e.target.value)}
                  className="w-1/3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="Header name"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, "value", e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="Header value"
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(header.id)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-red-500 hover:text-red-400"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Query Parameters Section */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Query Parameters</h2>
            <button
              type="button"
              onClick={addQueryParam}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              <PlusIcon className="h-3 w-3" />
              Add Parameter
            </button>
          </div>
          
          <div className="space-y-2">
            {queryParams.map((param) => (
              <div key={param.id} className="flex gap-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateQueryParam(param.id, "key", e.target.value)}
                  className="w-1/3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="Parameter name"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateQueryParam(param.id, "value", e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  placeholder="Parameter value"
                />
                {queryParams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQueryParam(param.id)}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-red-500 hover:text-red-400"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body Section (only for POST/PUT/PATCH/DELETE) */}
        {formData.method !== "GET" && (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Request Body (JSON)</h2>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder={'{\n  "key": "value",\n  "dynamic": "{{paramName}}"\n}'}
            />
            <p className="text-xs text-slate-500">
              Must be valid JSON. Use {"{{"} paramName {"}"} for dynamic values.
            </p>
          </div>
        )}

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

