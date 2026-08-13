export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = "OK" | "Low" | "Out";

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "Out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "Low";
  return "OK";
}
