import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getSessionRole } from "@/server/authz";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

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
    <>
      <Navbar role={role} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <MobileBottomNav role={role} />
    </>
  );
}
