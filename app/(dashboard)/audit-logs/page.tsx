"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import { AuditLog, Order } from "@/types";
import {
  formatDateTime,
  orderStatusColor,
  orderStatusLabel,
} from "@/lib/utils";
import {
  Search,
  ScrollText,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

function actionLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

function AuditIcon({ action }: { action: string }) {
  if (action.includes("FULFILLED") && !action.includes("FAILED"))
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (action.includes("FAILED"))
    return <XCircle className="w-4 h-4 text-red-500" />;
  if (action.includes("SUCCESS"))
    return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
  if (action.includes("CREATED"))
    return <Package className="w-4 h-4 text-muted-foreground" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
}

function AuditTimeline({ orderId }: { orderId: string }) {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["order-audit", orderId],
    queryFn: () => ordersApi.getAuditLog(orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-4 h-4 rounded-full bg-muted animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded animate-pulse w-40" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No audit entries for this order
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="relative">
        <div className="absolute left-1.75 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-5">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 relative">
              <div className="w-4 h-4 shrink-0 flex items-center justify-center relative z-10 bg-card">
                <AuditIcon action={log.action} />
              </div>
              <div className="flex-1 pb-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-foreground">
                    {actionLabel(log.action)}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-2 bg-muted/50 border border-border rounded-lg px-3 py-2 space-y-0.5">
                    {Object.entries(log.metadata).map(([k, v]) => (
                      <p key={k} className="text-xs text-muted-foreground">
                        <span className="opacity-60">{k}:</span>{" "}
                        <span className="text-foreground/80">{String(v)}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  selected,
  onClick,
}: {
  order: Order;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors last:border-0 ${
        selected ? "bg-emerald-500/10" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-mono text-emerald-500 truncate">
          {order.reference}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            selected ? "text-emerald-500" : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}
        >
          {orderStatusLabel(order.status)}
        </span>
        <span className="text-xs text-muted-foreground">
          {order.user.phoneNumber}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        {formatDateTime(order.createdAt)}
      </p>
    </button>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", "audit-page"],
    queryFn: () => ordersApi.getAll({ page: 1, limit: 100 }),
  });

  const orders = data?.orders ?? [];

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          o.reference.toLowerCase().includes(search.toLowerCase()) ||
          o.user.phoneNumber.includes(search),
      )
    : orders;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Full event trail for every order
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 items-start">
        {/* Order list panel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or phone..."
                className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Order list */}
          <div className="overflow-y-auto max-h-150">
            {ordersLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3.5 bg-muted rounded animate-pulse w-32" />
                    <div className="h-2.5 bg-muted rounded animate-pulse w-20" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No orders found
              </div>
            ) : (
              filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                />
              ))
            )}
          </div>

          {/* Footer count */}
          {!ordersLoading && (
            <div className="px-4 py-2.5 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Audit trail panel */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          {selectedOrder ? (
            <>
              {/* Selected order header */}
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground font-mono">
                      {selectedOrder.reference}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(selectedOrder.status)}`}
                    >
                      {orderStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                    {selectedOrder.user.phoneNumber} ·{" "}
                    {selectedOrder.recipientPhone}
                  </p>
                </div>
                <Link
                  href={`/orders/${selectedOrder.id}`}
                  className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  View order
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <AuditTimeline orderId={selectedOrder.id} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <ScrollText className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Select an order
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Choose an order from the list to view its full audit trail
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
