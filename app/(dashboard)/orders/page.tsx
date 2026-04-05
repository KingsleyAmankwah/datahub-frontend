"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  orderStatusColor,
  orderStatusLabel,
  networkColor,
} from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PaginatedOrders } from "@/model/interface";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Fulfilled", value: "FULFILLED" },
  { label: "Paying", value: "PAYMENT_INITIATED" },
  { label: "Sending", value: "FULFILLMENT_INITIATED" },
  { label: "Failed", value: "FULFILLMENT_FAILED" },
  { label: "Payment Failed", value: "PAYMENT_FAILED" },
  { label: "Pending", value: "PENDING" },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ["orders", page, status],
    queryFn: () =>
      ordersApi.getAll({ page, limit: 20, status: status || undefined }),
  });

  const orders = data?.orders ?? [];

  const filtered = search
    ? orders.filter(
        (o) =>
          o.user.phoneNumber.includes(search) ||
          o.recipientPhone.includes(search) ||
          o.reference.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  const exportCSV = () => {
    const rows = [
      [
        "Reference",
        "Customer",
        "Recipient",
        "Network",
        "Bundle",
        "Amount (GHS)",
        "Status",
        "Date",
      ],
      ...orders.map((o) => [
        o.reference,
        o.user.phoneNumber,
        o.recipientPhone,
        o.recipientNetwork,
        o.bundle?.name ?? "",
        (o.amount / 100).toFixed(2),
        o.status,
        new Date(o.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total ?? 0} total orders
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground text-sm rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone or reference..."
            className="w-full pl-9 pr-3.5 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                status === f.value
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Reference
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Recipient
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Network
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Bundle
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-sm font-mono text-emerald-500 hover:text-emerald-400"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {order.user.phoneNumber}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {order.recipientPhone}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkColor(order.recipientNetwork)}`}
                        >
                          {order.recipientNetwork}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {order.bundle?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                        {formatGHS(order.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}
                        >
                          {orderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {data.page} of {data.pages} · {data.total} orders
            </p>
            <div className="flex items-center gap-2">
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
    </div>
  );
}
