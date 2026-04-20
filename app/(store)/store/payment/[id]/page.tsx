"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import { formatGHS, orderStatusLabel, TERMINAL_STATUSES } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Smartphone } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: order } = useQuery({
    queryKey: ["order", "status", id],
    queryFn: () => ordersApi.getStatus(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 3000;
    },
  });

  // Redirect to order status page once fulfilled or failed — delay gives user time to read the result
  useEffect(() => {
    if (!order?.status || !TERMINAL_STATUSES.includes(order.status)) return;
    const timer = setTimeout(() => router.replace(`/store/orders/${id}`), 30000);
    return () => clearTimeout(timer);
  }, [order?.status, id, router]);

  const isPending = !order || !TERMINAL_STATUSES.includes(order.status);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      {isPending ? (
        <>
          {/* Pulsing phone icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <Smartphone className="w-9 h-9 text-emerald-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Approve the payment
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              A Mobile Money prompt has been sent to{" "}
              <span className="font-mono font-medium text-foreground">
                {order?.recipientPhone ?? "your number"}
              </span>
              . Approve it to complete your purchase.
            </p>
          </div>

          {order && (
            <div className="w-full bg-card border border-border rounded-xl p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  {formatGHS(order.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono text-foreground">
                  {order.recipientPhone}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bundle</span>
                <span className="text-foreground">
                  {order.recipientNetwork}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-amber-500 font-medium">
                  {orderStatusLabel(order.status)}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Waiting for payment confirmation…
          </p>
        </>
      ) : order?.status === "FULFILLED" ? (
        // Should redirect before this renders, but just in case
        <div className="space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <p className="text-lg font-bold text-foreground">
            Payment successful
          </p>
          <Link
            href={`/store/orders/${id}`}
            className="text-sm text-emerald-500"
          >
            View order →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <XCircle className="w-14 h-14 text-red-500 mx-auto" />
          <p className="text-lg font-bold text-foreground">Payment failed</p>
          <p className="text-sm text-muted-foreground">
            {orderStatusLabel(order.status)}
          </p>
          <Link href="/store" className="text-sm text-emerald-500">
            Try again →
          </Link>
        </div>
      )}
    </div>
  );
}
