"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  orderStatusLabel,
  TERMINAL_STATUSES,
  STATUS_ORDER,
  STATUS_STEPS,
} from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Package,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function StepIcon({
  state,
}: {
  state: "done" | "active" | "failed" | "pending";
}) {
  if (state === "done")
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (state === "failed") return <XCircle className="w-5 h-5 text-red-500" />;
  if (state === "active")
    return <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />;
  return <div className="w-5 h-5 rounded-full border-2 border-border" />;
}

export default function OrderStatusPage() {
  const ref =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("order_lookup_ref") ?? "")
      : "";
  const phone =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("order_lookup_phone") ?? "")
      : "";

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", "lookup", ref, phone],
    queryFn: () => ordersApi.lookup(ref, phone),
    enabled: !!ref && !!phone,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 3000;
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["order-audit", "lookup", ref, phone],
    queryFn: () => ordersApi.lookupAudit(ref, phone),
    enabled: !!order && !!ref && !!phone,
    refetchInterval: () => {
      const status = order?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 3000;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!ref || !phone) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-foreground font-medium">Verification required</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Please look up your order first
        </p>
        <Link href="/store/orders" className="text-sm text-emerald-500">
          Go to order lookup →
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-foreground font-medium">Order not found</p>
        <Link href="/store" className="text-sm text-emerald-500 mt-2">
          Go home →
        </Link>
      </div>
    );
  }

  const isFulfilled = order.status === "FULFILLED";
  const isFailed =
    order.status === "FULFILLMENT_FAILED" || order.status === "PAYMENT_FAILED";
  const currentIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/store/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Order history
      </Link>

      {/* Status hero */}
      <div
        className={`rounded-xl p-5 text-center space-y-2 ${
          isFulfilled
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : isFailed
              ? "bg-red-500/10 border border-red-500/20"
              : "bg-card border border-border"
        }`}
      >
        {isFulfilled ? (
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        ) : isFailed ? (
          <XCircle className="w-10 h-10 text-red-500 mx-auto" />
        ) : (
          <Loader2 className="w-10 h-10 text-emerald-500 mx-auto animate-spin" />
        )}
        <p className="text-lg font-bold text-foreground">
          {isFulfilled
            ? "Data delivered!"
            : isFailed
              ? "Order failed"
              : "Processing your order…"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isFulfilled
            ? `${order.bundle?.dataMb ? (order.bundle.dataMb >= 1024 ? `${(order.bundle.dataMb / 1024).toFixed(0)}GB` : `${order.bundle.dataMb}MB`) : order.bundle?.name} sent to ${order.recipientPhone}`
            : isFailed
              ? orderStatusLabel(order.status)
              : "This page updates automatically"}
        </p>
      </div>

      {/* Order details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Order details
        </p>
        {[
          {
            label: "Reference",
            value: (
              <span className="font-mono text-emerald-500">
                {order.reference}
              </span>
            ),
          },
          { label: "Amount", value: formatGHS(order.amount) },
          { label: "Network", value: order.recipientNetwork },
          {
            label: "Recipient",
            value: <span className="font-mono">{order.recipientPhone}</span>,
          },
          { label: "Bundle", value: order.bundle?.name ?? "—" },
          { label: "Placed", value: formatDateTime(order.createdAt) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground font-medium text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Progress steps */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Progress
        </p>
        <div className="space-y-4">
          {STATUS_STEPS.map((step, i) => {
            let state: "done" | "active" | "failed" | "pending" = "pending";
            if (isFailed && i <= currentIndex) {
              state = i === currentIndex ? "failed" : "done";
            } else if (i < currentIndex || isFulfilled) {
              state = "done";
            } else if (i === currentIndex) {
              state = "active";
            }

            return (
              <div key={step.key} className="flex items-center gap-3">
                <StepIcon state={state} />
                <span
                  className={`text-sm ${
                    state === "done" || state === "active"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {state === "active" && !isFailed && (
                  <span className="ml-auto text-xs text-emerald-500">
                    In progress
                  </span>
                )}
                {state === "failed" && (
                  <span className="ml-auto text-xs text-red-500">Failed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit trail */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Activity
          </p>
          <div className="relative">
            <div className="absolute left-1.75 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-3 relative">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center relative z-10 bg-card">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {log.action
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/^./, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pb-2">
        {isFailed && (
          <Link
            href="/store"
            className="flex items-center justify-center w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Try again
          </Link>
        )}
        <Link
          href="/store/orders"
          className="flex items-center justify-center w-full py-3 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl transition-colors text-sm"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
}
