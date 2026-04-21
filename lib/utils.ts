import { OrderStatus } from "@/model/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in cents to GHS currency format
 * @param amountInCents - Amount in cents (e.g., 50000 = GH₵500.00)
 */
export function formatGHS(amountInCents: number): string {
  const amountInGHS = amountInCents / 100;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amountInGHS);
}

/**
 * Format ISO date string to readable date-time format
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00Z")
 */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

/**
 * Get human-readable label for order status
 */
export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    PAYMENT_INITIATED: "Paying",
    PAYMENT_SUCCESS: "Payment Confirmed",
    PAYMENT_FAILED: "Payment Failed",
    FULFILLMENT_INITIATED: "Sending",
    FULFILLMENT_FAILED: "Failed",
    FULFILLED: "Fulfilled",
    REFUNDED: "Refunded",
  };
  return labels[status] || status;
}

/**
 * Get Tailwind CSS classes for order status badge color
 */
export function orderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    PAYMENT_INITIATED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    PAYMENT_SUCCESS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    PAYMENT_FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
    FULFILLMENT_INITIATED:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    FULFILLMENT_FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
    FULFILLED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    REFUNDED: "bg-muted text-muted-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

/**
 * Get Tailwind CSS classes for network badge color
 */
export function networkColor(network: string): string {
  const colors: Record<string, string> = {
    MTN: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    TELECEL: "bg-red-500/10 text-red-600 dark:text-red-400",
    AIRTELTIGO: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  return colors[network.toUpperCase()] || "bg-muted text-muted-foreground";
}

/**
 * Convert ISO date string to relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00Z")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;

  return `${Math.floor(seconds / 2592000)}mo ago`;
}

const NETWORK_PREFIXES: Record<string, string> = {
  "024": "MTN",
  "054": "MTN",
  "055": "MTN",
  "059": "MTN",
  "020": "TELECEL",
  "050": "TELECEL",
  "027": "AIRTELTIGO",
  "057": "AIRTELTIGO",
  "026": "AIRTELTIGO",
  "056": "AIRTELTIGO",
};

export function detectNetwork(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const prefix = digits.slice(0, 3);
  return NETWORK_PREFIXES[prefix] ?? null;
}

export function formatPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export const TERMINAL_STATUSES = [
  "FULFILLED",
  "FULFILLMENT_FAILED",
  "PAYMENT_FAILED",
  "REFUNDED",
];

export const STATUS_STEPS = [
  { key: "PENDING", label: "Order placed" },
  { key: "PAYMENT_INITIATED", label: "Payment initiated" },
  { key: "PAYMENT_SUCCESS", label: "Payment confirmed" },
  { key: "FULFILLMENT_INITIATED", label: "Sending data" },
  { key: "FULFILLED", label: "Data delivered" },
];

export const STATUS_ORDER = [
  "PENDING",
  "PAYMENT_INITIATED",
  "PAYMENT_SUCCESS",
  "FULFILLMENT_INITIATED",
  "FULFILLED",
];

export const NETWORKS = [
  {
    name: "MTN",
    color: "bg-yellow-400",
    textColor: "text-yellow-900",
    borderColor: "border-yellow-200 dark:border-yellow-900/40",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/10",
    href: "/store/buy?network=MTN",
  },
  {
    name: "Telecel",
    color: "bg-red-500",
    textColor: "text-red-900",
    borderColor: "border-red-200 dark:border-red-900/40",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    href: "/store/buy?network=TELECEL",
  },
  {
    name: "AirtelTigo",
    color: "bg-blue-500",
    textColor: "text-blue-900",
    borderColor: "border-blue-200 dark:border-blue-900/40",
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    href: "/store/buy?network=AIRTELTIGO",
  },
];
