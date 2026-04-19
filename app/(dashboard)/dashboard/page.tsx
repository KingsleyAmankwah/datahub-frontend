"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi, bundlesApi } from "@/lib/api";
import {
  formatGHS,
  orderStatusColor,
  orderStatusLabel,
  networkColor,
  timeAgo,
} from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Bundle, Order, PaginatedOrders } from "@/model/interface";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-1.5">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function getToday(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekAgo(now: number) {
  return new Date(now - 7 * 24 * 60 * 60 * 1000);
}

function buildChartData(now: number, orders: Order[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d.getTime() + 86400000);
    const amount = orders
      .filter(
        (o) =>
          o.status === "FULFILLED" &&
          new Date(o.createdAt) >= d &&
          new Date(o.createdAt) < next,
      )
      .reduce((sum, o) => sum + o.amount, 0);
    return { day: d.toLocaleDateString("en-GH", { weekday: "short" }), amount };
  });
}

export default function DashboardPage() {
  const [now] = useState<number>(() => Date.now());

  const { data: ordersData, isLoading: ordersLoading } =
    useQuery<PaginatedOrders>({
      queryKey: ["orders", "all"],
      queryFn: () => ordersApi.getAll({ page: 1, limit: 100 }),
    });

  const { data: bundles } = useQuery<Bundle[]>({
    queryKey: ["bundles"],
    queryFn: () => bundlesApi.getAll(),
  });

  const orders = ordersData?.orders ?? [];
  const today = getToday(now);
  const weekAgo = getWeekAgo(now);
  const chartData = buildChartData(now, orders);

  const revenueToday = orders
    .filter((o) => o.status === "FULFILLED" && new Date(o.createdAt) >= today)
    .reduce((sum, o) => sum + o.amount, 0);

  const revenueWeek = orders
    .filter((o) => o.status === "FULFILLED" && new Date(o.createdAt) >= weekAgo)
    .reduce((sum, o) => sum + o.amount, 0);

  const fulfilled = orders.filter((o) => o.status === "FULFILLED").length;
  const failed = orders.filter(
    (o) => o.status === "FULFILLMENT_FAILED" || o.status === "PAYMENT_FAILED",
  ).length;
  const pending = orders.filter(
    (o) =>
      ![
        "FULFILLED",
        "FULFILLMENT_FAILED",
        "PAYMENT_FAILED",
        "REFUNDED",
      ].includes(o.status),
  ).length;

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

  const networkBreakdown = orders.reduce(
    (acc, o) => {
      acc[o.recipientNetwork] = (acc[o.recipientNetwork] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const recentOrders = orders.slice(0, 8);

  if (ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 animate-pulse"
            >
              <div className="h-3 bg-muted rounded w-24 mb-3" />
              <div className="h-7 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your platform at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue today"
          value={formatGHS(revenueToday)}
          icon={TrendingUp}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          label="Revenue this week"
          value={formatGHS(revenueWeek)}
          icon={TrendingUp}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          label="Total orders"
          value={String(orders.length)}
          sub={`${fulfilled} fulfilled`}
          icon={ShoppingCart}
          color="bg-muted text-muted-foreground"
        />
        <StatCard
          label="Active bundles"
          value={String(bundles?.length ?? 0)}
          icon={Package}
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {fulfilled}
            </p>
            <p className="text-xs text-muted-foreground">Fulfilled</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-semibold text-foreground">{pending}</p>
            <p className="text-xs text-muted-foreground">In progress</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-2xl font-semibold text-foreground">{failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Revenue â€” last 7 days
          </h2>
          <div className="flex items-end gap-2 h-32">
            {chartData.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-full flex items-end justify-center"
                  style={{ height: "96px" }}
                >
                  <div
                    className="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-500 min-h-0.5"
                    style={{ height: `${(d.amount / maxAmount) * 96}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">
            By network
          </h2>
          <div className="space-y-3">
            {Object.entries(networkBreakdown).map(([network, count]) => (
              <div key={network}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${networkColor(network)}`}
                  >
                    {network}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count} orders
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / orders.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(networkBreakdown).length === 0 && (
              <p className="text-xs text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Recent orders</h2>
          <Link
            href="/orders"
            className="text-xs text-emerald-500 hover:text-emerald-400"
          >
            View all orders →
          </Link>
        </div>
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
                  Network
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-sm font-mono text-emerald-500 hover:text-emerald-400"
                    >
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground/80">
                    {order.user.phoneNumber}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkColor(order.recipientNetwork)}`}
                    >
                      {order.recipientNetwork}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground font-medium">
                    {formatGHS(order.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {timeAgo(order.createdAt)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
