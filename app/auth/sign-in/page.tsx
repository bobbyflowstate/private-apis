import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

const ERROR_MESSAGES: Record<string, string> = {
  auth_unavailable:
    "Couldn't reach the authentication service, so your session couldn't be confirmed. If the Supabase project auto-paused after a week of inactivity, resume it from the Supabase dashboard and reload — you may still be signed in.",
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const errorMessage = searchParams?.error
    ? ERROR_MESSAGES[searchParams.error]
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Private APIs</h1>
          <p className="text-sm text-slate-400">
            Access your personal command center for private endpoints.
          </p>
        </header>
        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200"
          >
            {errorMessage}
          </p>
        )}
        <SignInForm />
        <div className="text-center text-xs text-slate-500">
          <p>
            Need an invite? Contact the project owner or return to the {" "}
            <Link className="text-brand-400 hover:text-brand-300" href="/">
              dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
