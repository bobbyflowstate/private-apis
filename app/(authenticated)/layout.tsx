import type { PropsWithChildren } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { SidebarNav } from "@/components/common/sidebar-nav";
import { MobileNav } from "@/components/common/mobile-nav";
import { TopBar } from "@/components/common/top-bar";

export default async function AuthenticatedLayout({ children }: PropsWithChildren) {
  const user = await requireAuth();
  const email = user.email ?? "";

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <SidebarNav email={email} />
      <div className="flex min-h-screen w-full max-w-full flex-1 flex-col">
        <MobileNav email={email} />
        <TopBar email={email} />
        <main className="flex-1 bg-slate-950/90 pb-16 pt-6 text-slate-100">
          <div className="px-4 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
