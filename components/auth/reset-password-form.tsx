"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/hooks/use-supabase";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = useSupabase();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Success! Redirect to dashboard
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          New password
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-200" htmlFor="confirm-password">
          Confirm new password
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
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
        {loading ? "Updating password..." : "Reset password"}
      </button>
    </form>
  );
}

