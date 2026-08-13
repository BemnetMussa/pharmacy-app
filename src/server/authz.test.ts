import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/utils/errors";

vi.mock("@/server/session", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "@/server/session";
import {
  getSessionRole,
  requireAdmin,
  requireSession,
} from "@/server/authz";

const getSessionMock = vi.mocked(getSession);

describe("authz", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  it("requireSession throws when logged out", async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(requireSession()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      statusCode: 401,
    } satisfies Partial<AppError>);
  });

  it("requireSession returns the session when logged in", async () => {
    const session = {
      user: { id: "1", name: "Dr. Amina Bekele", email: "admin@leyumed.com" },
    };
    getSessionMock.mockResolvedValue(session as never);
    await expect(requireSession()).resolves.toEqual(session);
  });

  it("requireAdmin allows ADMIN", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "1", role: "ADMIN" },
    } as never);
    await expect(requireAdmin()).resolves.toBeTruthy();
  });

  it("requireAdmin forbids PHARMACIST", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "2", role: "PHARMACIST" },
    } as never);
    await expect(requireAdmin()).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
    });
  });

  it("getSessionRole returns null when logged out", async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(getSessionRole()).resolves.toBeNull();
  });

  it("getSessionRole defaults missing role to PHARMACIST", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "3" },
    } as never);
    await expect(getSessionRole()).resolves.toBe("PHARMACIST");
  });
});
