import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RequestHeader } from "@/components/requests/request-header";
import { RequestConfiguration } from "@/components/requests/request-configuration";
import { RequestExecutionPanel } from "@/components/requests/request-execution-panel";
import { fetchApiRequestById } from "@/lib/api/requests";

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const data = await fetchApiRequestById(params.id).catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <RequestHeader request={data} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading configuration...</div>}>
          <RequestConfiguration request={data} />
        </Suspense>
        <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">Loading execution log...</div>}>
          <RequestExecutionPanel request={data} />
        </Suspense>
      </div>
    </div>
  );
}
