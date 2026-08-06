import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const etbFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  currencyDisplay: "code",
});

export function formatMoney(amount: number) {
  return etbFormatter.format(amount);
}
