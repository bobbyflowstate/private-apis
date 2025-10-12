"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navigationLinks } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { getIconComponent } from "@/lib/utils/icons";
import { Logo } from "@/components/common/logo";

interface MobileNavProps {
  email: string;
}

export function MobileNav({ email }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="lg:hidden">
        <div className="flex h-[49px] items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-3" />
      </div>
    );
  }

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-3">
        <Logo />
        <button
          type="button"
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>
      </div>
      {open && (
        <nav className="space-y-1 border-b border-slate-800/80 bg-slate-950/80 px-4 py-4 text-sm">
          {navigationLinks.map((item) => {
            const Icon = getIconComponent(item.icon);
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 font-medium",
                  isActive ? "bg-slate-800/60 text-slate-100" : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="mt-4 rounded-lg bg-slate-900/50 p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-200">Signed in</p>
            <p className="truncate">{email}</p>
          </div>
        </nav>
      )}
    </div>
  );
}
