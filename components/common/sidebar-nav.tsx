"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navigationLinks } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { getIconComponent } from "@/lib/utils/icons";
import { useUIStore } from "@/store/ui-store";
import { Logo } from "@/components/common/logo";

interface SidebarNavProps {
  email: string;
}

export function SidebarNav({ email }: SidebarNavProps) {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-800/70 bg-slate-950/80 p-4 lg:flex lg:flex-col" />
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-slate-800/70 bg-slate-950/80 p-4 lg:flex lg:flex-col",
        collapsed ? "w-[88px]" : "w-64"
      )}
    >
      <div className="flex items-center justify-between">
        <Logo collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-xs">{collapsed ? "»" : "«"}</span>
        </button>
      </div>
      <nav className="mt-8 flex-1 space-y-1 text-sm">
        {navigationLinks.map((item) => {
          const Icon = getIconComponent(item.icon);
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-slate-400 transition",
                isActive && "bg-slate-800/60 text-slate-100",
                !isActive && "hover:bg-slate-800/40 hover:text-slate-100",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <footer className={cn("mt-auto rounded-lg bg-slate-900/40 p-3 text-xs text-slate-400", collapsed && "text-center")}
      >
        <p className="truncate">{email}</p>
      </footer>
    </aside>
  );
}
