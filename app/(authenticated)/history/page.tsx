import { Suspense } from "react";
import { ExecutionHistoryTable } from "@/components/history/execution-history-table";

export default function HistoryPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-slate-400">
          Review recent request executions and their outcomes.
        </p>
      </header>
      <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading history...</div>}>
        <ExecutionHistoryTable />
      </Suspense>
    </div>
  );
}
