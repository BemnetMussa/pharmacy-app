import { AppError } from "@/shared/utils/errors";
import { getSession } from "@/server/session";

export type Role = "ADMIN" | "PHARMACIST";

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const role = (session.user as { role?: Role }).role;
  if (role !== "ADMIN") {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }
  return session;
}

export async function getSessionRole(): Promise<Role | null> {
  const session = await getSession();
  if (!session) return null;
  return ((session.user as { role?: Role }).role ?? "PHARMACIST") as Role;
}
