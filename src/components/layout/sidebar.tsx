"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

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
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar({ role }: { role: NavRole }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="text-sm font-semibold tracking-tight">leyuMed</div>
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}

export function MobileSidebar({ role }: { role: NavRole }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="md:hidden" />
        }
      >
        <Menu size={18} />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <div className="flex flex-col gap-4 pt-4">
          <div className="text-sm font-semibold tracking-tight">leyuMed</div>
          <SidebarNav role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
