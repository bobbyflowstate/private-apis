import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getIconComponent(name: string): LucideIcon {
  const icon = (Icons as Record<string, LucideIcon>)[name];
  return icon ?? Icons.Circle;
}
