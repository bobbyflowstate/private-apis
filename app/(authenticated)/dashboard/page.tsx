import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { RecentExecutions } from "@/components/dashboard/recent-executions";
import { FavoriteRequests } from "@/components/dashboard/favorite-requests";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Quick access to your most used API requests and recent activity.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading favourites...</div>}>
            <FavoriteRequests />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading executions...</div>}>
            <RecentExecutions />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading overview...</div>}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
