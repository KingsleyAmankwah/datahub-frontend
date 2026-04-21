"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  TERMINAL_STATUSES,
} from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { OrderPublicStatus } from "@/model/interface";

const AGENT_STATUS_STEPS = [
  { key: "PAYMENT_SUCCESS", label: "Payment confirmed" },
  { key: "FULFILLMENT_INITIATED", label: "Sending data" },
  { key: "FULFILLED", label: "Data delivered" },
];

const AGENT_STATUS_ORDER = [
  "PAYMENT_SUCCESS",
  "FULFILLMENT_INITIATED",
  "FULFILLED",
];

function StepIcon({ state }: { state: "done" | "active" | "failed" | "pending" }) {
  if (state === "done") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (state === "failed") return <XCircle className="w-5 h-5 text-red-500" />;
  if (state === "active") return <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />;
  return <div className="w-5 h-5 rounded-full border-2 border-border" />;
}

export default function AgentOrderStatusPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<OrderPublicStatus>({
    queryKey: ["order", "status", id],
    queryFn: () => ordersApi.getStatus(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 3000;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-40 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!order) return null;

  const isFulfilled = order.status === "FULFILLED";
  const isFailed =
    order.status === "FULFILLMENT_FAILED" || order.status === "PAYMENT_FAILED";
  const currentIndex = AGENT_STATUS_ORDER.indexOf(order.status);

  return (
    <div className="space-y-6">
      <Link
        href="/store/agent/orders"
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
              : "Sending data…"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isFulfilled
            ? `Sent to ${order.recipientPhone}`
            : isFailed
              ? "Something went wrong. Contact support if funds were deducted."
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
            value: <span className="font-mono text-emerald-500">{order.reference}</span>,
          },
          { label: "Amount", value: formatGHS(order.amount) },
          { label: "Network", value: order.recipientNetwork },
          {
            label: "Recipient",
            value: <span className="font-mono">{order.recipientPhone}</span>,
          },
          { label: "Placed", value: formatDateTime(order.createdAt) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground font-medium text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Progress steps */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Progress
        </p>
        <div className="space-y-4">
          {AGENT_STATUS_STEPS.map((step, i) => {
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
                {state === "active" && (
                  <span className="ml-auto text-xs text-emerald-500">In progress</span>
                )}
                {state === "failed" && (
                  <span className="ml-auto text-xs text-red-500">Failed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <Link
          href="/store/agent/orders/new"
          className="flex items-center justify-center w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Place another order
        </Link>
        <Link
          href="/store/agent/orders"
          className="flex items-center justify-center w-full py-3 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl transition-colors text-sm"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
}
