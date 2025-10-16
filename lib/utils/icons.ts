import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getIconComponent(name: string): LucideIcon {
  const icon = (Icons as any)[name];
  if (icon && typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return Icons.Circle;
}
