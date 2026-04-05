"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import {
  formatGHS,
  formatDateTime,
  orderStatusColor,
  orderStatusLabel,
  networkColor,
} from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { AuditLog, Order } from "@/model/interface";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground text-right flex-1">{value}</span>
    </div>
  );
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id),
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ["order-audit", id],
    queryFn: () => ordersApi.getAuditLog(id),
    enabled: !!order,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-3 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/orders" className="text-emerald-500 text-sm mt-3">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          href="/orders"
          className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground font-mono">
              {order.reference}
            </h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusColor(order.status)}`}
            >
              {orderStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">
            {formatGHS(order.amount)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Order info */}
        <Section title="Order details">
          <Row
            label="Reference"
            value={
              <span className="font-mono text-emerald-500">
                {order.reference}
              </span>
            }
          />
          <Row label="Amount" value={formatGHS(order.amount)} />
          <Row
            label="Network"
            value={
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkColor(order.recipientNetwork)}`}
              >
                {order.recipientNetwork}
              </span>
            }
          />
          <Row label="Created" value={formatDateTime(order.createdAt)} />
          <Row
            label="Updated"
            value={order.updatedAt ? formatDateTime(order.updatedAt) : "—"}
          />
        </Section>

        {/* Customer info */}
        <Section title="Customer">
          <Row
            label="Buyer"
            value={
              <span className="flex items-center gap-1.5 justify-end">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {order.user?.phoneNumber}
              </span>
            }
          />
          <Row
            label="Recipient"
            value={
              <span className="flex items-center gap-1.5 justify-end">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {order.recipientPhone}
              </span>
            }
          />
          <Row
            label="Self purchase"
            value={
              order.user?.phoneNumber === order.recipientPhone ? "Yes" : "No"
            }
          />
        </Section>

        {/* Bundle info */}
        {order.bundle && (
          <Section title="Bundle">
            <Row label="Name" value={order.bundle.name} />
            <Row
              label="Data"
              value={
                order.bundle.dataMb
                  ? order.bundle.dataMb >= 1024
                    ? `${(order.bundle.dataMb / 1024).toFixed(0)}GB`
                    : `${order.bundle.dataMb}MB`
                  : "—"
              }
            />
            <Row
              label="Validity"
              value={`${order.bundle.validityDays} day${order.bundle.validityDays !== 1 ? "s" : ""}`}
            />
            <Row label="Cost price" value={formatGHS(order.bundle.costPrice)} />
            <Row
              label="Selling price"
              value={formatGHS(order.bundle.sellingPrice)}
            />
            <Row
              label="Margin"
              value={
                <span className="text-emerald-500">
                  {formatGHS(
                    order.bundle.sellingPrice - order.bundle.costPrice,
                  )}
                </span>
              }
            />
          </Section>
        )}

        {/* Payment info */}
        {order.payment && (
          <Section title="Payment">
            <Row label="Provider" value={order.payment.provider} />
            <Row
              label="Status"
              value={
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.payment.status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : order.payment.status === "FAILED"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {order.payment.status}
                </span>
              }
            />
            <Row
              label="Provider ref"
              value={
                <span className="font-mono text-xs">
                  {order.payment.providerRef ?? "—"}
                </span>
              }
            />
            <Row
              label="Initiated"
              value={formatDateTime(order.payment.initiatedAt)}
            />
            {order.payment.completedAt && (
              <Row
                label="Completed"
                value={formatDateTime(order.payment.completedAt)}
              />
            )}
          </Section>
        )}

        {/* Fulfillment info */}
        {order.fulfillment && (
          <Section title="Fulfillment">
            <Row label="Provider" value={order.fulfillment.provider} />
            <Row
              label="Status"
              value={
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.fulfillment.status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : order.fulfillment.status === "FAILED"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {order.fulfillment.status}
                </span>
              }
            />
            <Row
              label="Attempts"
              value={String(order.fulfillment.attemptCount)}
            />
            {order.fulfillment.lastAttemptAt && (
              <Row
                label="Last attempt"
                value={formatDateTime(order.fulfillment.lastAttemptAt)}
              />
            )}
            {order.fulfillment.completedAt && (
              <Row
                label="Completed"
                value={formatDateTime(order.fulfillment.completedAt)}
              />
            )}
          </Section>
        )}
      </div>

      {/* Audit log */}
      {auditLogs && auditLogs.length > 0 && (
        <Section title="Audit trail">
          <div className="relative">
            <div className="absolute left-1.75 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center relative z-10">
                    <AuditIcon action={log.action} />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {log.action
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/^./, (c) => c.toUpperCase())}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1.5 bg-muted/50 rounded-lg px-3 py-2">
                        {Object.entries(log.metadata).map(([k, v]) => (
                          <p key={k} className="text-xs text-muted-foreground">
                            <span className="opacity-60">{k}:</span>{" "}
                            <span>{String(v)}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
