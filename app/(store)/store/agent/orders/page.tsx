"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentOrdersApi } from "@/lib/api";
import { formatGHS, formatDateTime, orderStatusColor, orderStatusLabel, networkColor } from "@/lib/utils";
import { PaginatedAgentOrders } from "@/model/interface";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AgentOrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedAgentOrders>({
    queryKey: ["agent-orders", page],
    queryFn: () => agentOrdersApi.getAll(page),
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-5">
      <Link
        href="/store/agent/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Order history</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data?.total ?? 0} total orders
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))
          : orders.map((order) => (
              <Link
                key={order.id}
                href={`/store/agent/orders/${order.id}`}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-mono text-emerald-500 truncate">
                    {order.reference}
                  </span>
                  <span className="text-sm text-foreground font-mono">
                    {order.recipientPhone}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkColor(order.recipientNetwork)}`}
                    >
                      {order.recipientNetwork}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatGHS(order.amount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
              </Link>
            ))}
        {!isLoading && orders.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
            No orders yet.{" "}
            <Link href="/store/agent/orders/new" className="text-emerald-500">
              Place your first order →
            </Link>
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
