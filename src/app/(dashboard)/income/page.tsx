import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";

export const metadata = { title: "Income | leyuMed" };

/** Income UI is out of MVP — redirect away; Prisma model kept for later. */
export default async function IncomePage() {
  const session = await getSession();
  const role =
    (session?.user as { role?: Role } | undefined)?.role ?? "PHARMACIST";
  redirect(role === "ADMIN" ? "/dashboard" : "/sales");
}
