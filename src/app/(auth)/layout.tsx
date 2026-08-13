import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    const role =
      (session.user as { role?: Role } | undefined)?.role ?? "PHARMACIST";
    redirect(role === "ADMIN" ? "/dashboard" : "/sales");
  }

  return (
    <div className="bg-background relative flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
