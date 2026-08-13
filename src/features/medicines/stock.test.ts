import { describe, expect, it } from "vitest";
import {
  getStockStatus,
  LOW_STOCK_THRESHOLD,
} from "@/features/medicines/stock";

describe("getStockStatus", () => {
  it("returns Out when quantity is 0 or negative", () => {
    expect(getStockStatus(0)).toBe("Out");
    expect(getStockStatus(-3)).toBe("Out");
  });

  it("returns Low at and below the threshold", () => {
    expect(getStockStatus(1)).toBe("Low");
    expect(getStockStatus(LOW_STOCK_THRESHOLD)).toBe("Low");
  });

  it("returns OK above the threshold", () => {
    expect(getStockStatus(LOW_STOCK_THRESHOLD + 1)).toBe("OK");
    expect(getStockStatus(200)).toBe("OK");
  });
});
