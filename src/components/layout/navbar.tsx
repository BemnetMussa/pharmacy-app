"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { authClient } from "@/features/auth/auth-client";

export function Navbar({ role }: { role: "ADMIN" | "PHARMACIST" }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const homeHref = role === "ADMIN" ? "/dashboard" : "/sales";

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-lg font-bold">leyuMed</span>
        </Link>

        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "hover:text-foreground/80 transition-colors",
              pathname === "/" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Home
          </Link>
          {session && (
            <Link
              href={homeHref}
              className={cn(
                "hover:text-foreground/80 transition-colors",
                pathname?.startsWith("/dashboard") || pathname?.startsWith("/sales")
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {session ? (
            <UserMenu user={session.user} role={role} />
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className={cn(
                  "hover:text-foreground/80 text-sm font-medium transition-colors",
                  pathname === "/login"
                    ? "text-foreground"
                    : "text-foreground/60",
                )}
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
