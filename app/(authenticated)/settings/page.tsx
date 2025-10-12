import { Suspense } from "react";
import { SecretManagerPanel } from "@/components/settings/secret-manager-panel";
import { PreferencesPanel } from "@/components/settings/preferences-panel";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400">
          Manage secrets, preferences, and account options.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">Loading secrets...</div>}>
          <SecretManagerPanel />
        </Suspense>
        <PreferencesPanel />
      </div>
    </div>
  );
}
