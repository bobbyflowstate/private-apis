import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100",
        "hover:bg-slate-800/60",
        className
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-300 text-base font-bold">
        PA
      </span>
      {!collapsed && <span className="tracking-tight">Private APIs</span>}
    </Link>
  );
}
