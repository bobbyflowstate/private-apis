import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="text-sm text-slate-400">
            Enter your new password below. Make it strong and unique.
          </p>
        </header>
        <ResetPasswordForm />
        <div className="text-center text-xs text-slate-500">
          <p>
            Changed your mind?{" "}
            <Link className="text-brand-400 hover:text-brand-300" href="/auth/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

