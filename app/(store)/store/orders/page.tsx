"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  orderStatusColor,
  orderStatusLabel,
} from "@/lib/utils";
import { Search, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderHistoryPage() {
  const [input, setInput] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", "lookup", submittedId],
    queryFn: () => ordersApi.getById(submittedId),
    enabled: submittedId.length > 0,
    retry: false,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) setSubmittedId(input.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your order reference to check its status
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. DH-20240101-XXXX"
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Search className="w-4 h-4" />
          Look up order
        </button>
      </form>

      {submittedId && (
        <div>
          {isLoading ? (
            <div className="h-24 bg-muted rounded-xl animate-pulse" />
          ) : isError || !order ? (
            <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-xl text-center">
              <Package className="w-9 h-9 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Order not found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check the reference and try again
              </p>
            </div>
          ) : (
            <Link
              href={`/store/orders/${order.id}`}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium text-emerald-500 truncate">
                    {order.reference}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${orderStatusColor(order.status)}`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {order.bundle?.name ?? order.recipientNetwork} ·{" "}
                  {order.recipientPhone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-sm font-bold text-foreground">
                  {formatGHS(order.amount)}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="pt-2 text-center">
        <Link
          href="/store"
          className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          ← Buy a new bundle
        </Link>
      </div>
    </div>
  );
}
