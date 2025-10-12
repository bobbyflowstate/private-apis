import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center text-slate-100">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-slate-400">
        The requested resource could not be located. It may have been deleted or you may not have access to it.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
      >
        Return to dashboard
      </Link>
    </main>
  );
}
