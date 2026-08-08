"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavRole = "ADMIN" | "PHARMACIST";

const allLinks: ReadonlyArray<{
  href: string;
  label: string;
  roles: ReadonlyArray<NavRole>;
}> = [
  { href: "/dashboard", label: "Overview", roles: ["ADMIN"] },
  { href: "/medicines", label: "Medicines", roles: ["ADMIN", "PHARMACIST"] },
  { href: "/sales", label: "Sales", roles: ["ADMIN", "PHARMACIST"] },
  { href: "/reports", label: "Reports", roles: ["ADMIN"] },
];

function SidebarNav({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const links = allLinks.filter((l) => l.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-primary"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role }: { role: NavRole }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card md:block">
      <div className="flex h-full flex-col gap-6 p-5">
        <Link href={role === "ADMIN" ? "/dashboard" : "/sales"} className="flex items-center gap-2.5">
          <span className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
            <Pill className="text-primary size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">leyuMed</span>
        </Link>
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}
