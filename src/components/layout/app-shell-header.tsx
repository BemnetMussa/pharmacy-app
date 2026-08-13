"use client";

import Link from "next/link";
import { Pill } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import type { NavRole } from "./sidebar";

interface AppShellHeaderProps {
  role: NavRole;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppShellHeader({ role, user }: AppShellHeaderProps) {
  const homeHref = role === "ADMIN" ? "/dashboard" : "/sales";

  return (
    <header className="bg-card sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 md:hidden">
      <Link
        href={homeHref}
        className="flex min-h-11 items-center gap-2.5"
      >
        <span className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
          <Pill className="text-primary size-4" aria-hidden />
        </span>
        <span className="text-base font-semibold tracking-tight">leyuMed</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} role={role} />
      </div>
    </header>
  );
}
