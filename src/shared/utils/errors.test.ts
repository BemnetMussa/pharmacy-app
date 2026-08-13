import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/utils";
import { AppError, handleError } from "@/shared/utils/errors";

describe("formatMoney", () => {
  it("formats amounts in ETB", () => {
    const formatted = formatMoney(305.95);
    expect(formatted).toContain("ETB");
    expect(formatted).toMatch(/305/);
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toContain("ETB");
  });
});

describe("handleError", () => {
  it("preserves AppError status and code", () => {
    const result = handleError(
      new AppError("Admin access required", 403, "FORBIDDEN"),
    );
    expect(result).toEqual({
      message: "Admin access required",
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("maps generic Error to 500 INTERNAL_ERROR", () => {
    const result = handleError(new Error("boom"));
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.message).toBe("boom");
  });

  it("handles unknown values safely", () => {
    const result = handleError("weird");
    expect(result).toEqual({
      message: "An unexpected error occurred",
      statusCode: 500,
      code: "UNKNOWN_ERROR",
    });
  });
});
