import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus } from "@/types";

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
    PAYMENT_FAILED: "Payment Failed",
    FULFILLMENT_INITIATED: "Sending",
    FULFILLMENT_FAILED: "Failed",
    FULFILLED: "Fulfilled",
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
    PAYMENT_FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
    FULFILLMENT_INITIATED:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    FULFILLMENT_FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
    FULFILLED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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
