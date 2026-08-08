import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getSessionRole } from "@/server/authz";
import { AppShellHeader } from "@/components/layout/app-shell-header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { UserMenu } from "@/components/layout/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  const role = (await getSessionRole()) ?? "PHARMACIST";

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <AppShellHeader role={role} user={session.user} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="hidden items-center justify-end border-b border-border/60 bg-card px-6 py-3 md:flex">
            <UserMenu user={session.user} role={role} />
          </div>
          <main className="flex-1 p-4 pb-28 md:p-6 md:pb-6">{children}</main>
        </div>
      </div>
      <MobileBottomNav role={role} />
    </div>
  );
}
