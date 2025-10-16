"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/hooks/use-supabase";

export function ForgotPasswordForm() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-800/50 bg-green-900/20 p-4">
        <p className="text-sm text-green-300">
          Check your email! We've sent you a link to reset your password. The link will expire in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email address
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
      <button
        className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}

