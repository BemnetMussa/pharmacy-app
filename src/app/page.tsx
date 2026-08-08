import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";

/**
 * Internal app — no marketing landing.
 * Authed users go to their role home; everyone else to login.
 */
export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role =
    (session.user as { role?: Role } | undefined)?.role ?? "PHARMACIST";

  redirect(role === "ADMIN" ? "/dashboard" : "/sales");
}
