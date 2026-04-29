import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toString();
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function relativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

export const REGIONS = ["North Africa", "West Africa", "East Africa", "Central Africa", "Southern Africa"] as const;
export const DEPARTMENTS = [
  { code: "COO", name: "Office of COO" },
  { code: "ED", name: "Office of ED" },
  { code: "TECH", name: "Tech" },
  { code: "PROGRAMS", name: "Programs" },
  { code: "PARTNERSHIPS", name: "Partnerships" },
  { code: "EVENTS", name: "Events (AAG)" },
  { code: "MEMBERS", name: "Member Services" },
  { code: "PROCUREMENT", name: "Procurement & Operations" },
  { code: "COMMS", name: "Communications / PR" },
  { code: "FINANCE", name: "Finance" },
  { code: "AUDIT", name: "Audit & Compliance" },
  { code: "HR", name: "HR" },
] as const;
