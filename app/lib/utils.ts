import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function classNames(...items: (string | false | undefined)[]) {
  return items.filter(Boolean).join(" ");
}


export function formatPrice(price: number | undefined, decimals: number = 4): string {
  if (price === undefined || isNaN(price)) return "-";
  return price.toFixed(decimals);
}

export function formatPercentage(pct: number | undefined, showSign: boolean = false): string {
  if (pct === undefined || !isFinite(pct)) return "-";
  const sign = showSign && pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}
