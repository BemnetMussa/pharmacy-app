import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";

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
    <div className="bg-background flex min-h-dvh items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
