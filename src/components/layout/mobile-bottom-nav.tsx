"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavRole } from "./sidebar";

const tabs: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof Pill;
  roles: ReadonlyArray<NavRole>;
}> = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN"] },
  { href: "/medicines", label: "Medicines", icon: Pill, roles: ["ADMIN", "PHARMACIST"] },
  { href: "/sales", label: "Sales", icon: ShoppingCart, roles: ["ADMIN", "PHARMACIST"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN"] },
];

export function MobileBottomNav({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const items = tabs.filter((t) => t.roles.includes(role));

  return (
    <nav
      className="bg-card/95 supports-[backdrop-filter]:bg-card/90 fixed inset-x-0 bottom-0 z-50 border-t border-border/60 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden strokeWidth={isActive ? 2.25 : 1.75} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
