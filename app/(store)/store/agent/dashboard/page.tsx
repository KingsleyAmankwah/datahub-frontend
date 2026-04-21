"use client";

import { useQuery } from "@tanstack/react-query";
import { agentProfileApi } from "@/lib/api";
import { formatGHS } from "@/lib/utils";
import { Agent } from "@/model/interface";
import {
  Wallet,
  ShoppingCart,
  Clock,
  ArrowRight,
  AlertTriangle,
  Ban,
} from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/store/agent/orders/new", icon: ShoppingCart, label: "Place order", desc: "Buy a bundle for a customer" },
  { href: "/store/agent/wallet/topup", icon: Wallet, label: "Top up wallet", desc: "Load funds via MoMo" },
  { href: "/store/agent/wallet/transactions", icon: Clock, label: "Transactions", desc: "View wallet history" },
  { href: "/store/agent/orders", icon: Clock, label: "Order history", desc: "View all your orders" },
];

export default function AgentDashboardPage() {
  const { data: profile, isLoading } = useQuery<Agent>({
    queryKey: ["agent-profile"],
    queryFn: () => agentProfileApi.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-28 bg-muted rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isSuspended = profile.status === "SUSPENDED";
  const isPending = profile.status === "PENDING";

  return (
    <div className="space-y-5">
      {/* Status banners */}
      {isPending && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Account pending approval</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your application is under review. You&apos;ll be notified once approved.
            </p>
          </div>
        </div>
      )}
      {isSuspended && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <Ban className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Account suspended</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your account has been suspended. Contact support for assistance.
            </p>
          </div>
        </div>
      )}

      {/* Wallet balance card */}
      <div className="bg-emerald-500 rounded-2xl p-5 text-white">
        <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Wallet balance</p>
        <p className="text-3xl font-bold mt-1">{formatGHS(profile.user.walletBalance)}</p>
        <p className="text-xs opacity-70 mt-1">{profile.businessName}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {NAV_LINKS.map(({ href, icon: Icon, label, desc }) => {
          const disabled = isSuspended || (isPending && href !== "/store/agent/wallet/topup");
          return (
            <Link
              key={href}
              href={disabled ? "#" : href}
              aria-disabled={disabled}
              className={`flex flex-col gap-2 p-4 bg-card border border-border rounded-xl transition-colors ${
                disabled
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-muted active:scale-[0.98]"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground self-end" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
