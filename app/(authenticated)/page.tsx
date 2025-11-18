import { Suspense } from "react";
import { FavoriteRequests } from "@/components/dashboard/favorite-requests";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-slate-400">
          Pin your favorite requests and launch them from here instantly.
        </p>
      </header>
      <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading favorites...</div>}>
        <FavoriteRequests />
      </Suspense>
    </div>
  );
}
