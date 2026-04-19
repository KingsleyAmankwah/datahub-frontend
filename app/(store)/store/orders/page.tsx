"use client";

import { useState } from "react";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  orderStatusColor,
  orderStatusLabel,
} from "@/lib/utils";
import { Search, Package, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { Order } from "@/model/interface";

export default function OrderHistoryPage() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim();
    const ph = phone.trim();
    if (!ref || !ph) return;

    setIsLoading(true);
    setOrder(null);
    setNotFound(false);

    try {
      const result = await ordersApi.lookup(ref, ph);
      sessionStorage.setItem("order_lookup_ref", ref);
      sessionStorage.setItem("order_lookup_phone", ph);
      setOrder(result);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }

  const submitted = !isLoading && (order !== null || notFound);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your order reference and phone number to check its status
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Order reference e.g. BB-20240101-XXXX"
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number used to place order"
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!reference.trim() || !phone.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Search className="w-4 h-4" />
          {isLoading ? "Looking up…" : "Look up order"}
        </button>
      </form>

      {isLoading && <div className="h-24 bg-muted rounded-xl animate-pulse" />}

      {submitted && (
        <div>
          {notFound ? (
            <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-xl text-center">
              <Package className="w-9 h-9 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Order not found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your reference and phone number and try again
              </p>
            </div>
          ) : order ? (
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
          ) : null}
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
