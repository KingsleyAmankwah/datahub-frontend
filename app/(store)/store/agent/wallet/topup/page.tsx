"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentProfileApi } from "@/lib/api";
import { formatGHS, formatPhone } from "@/lib/utils";
import { Agent } from "@/model/interface";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import Link from "next/link";

export default function WalletTopUpPage() {
  const queryClient = useQueryClient();
  const [amountGHS, setAmountGHS] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [polling, setPolling] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const balanceBeforeRef = useRef<number | null>(null);

  const { data: profile } = useQuery<Agent>({
    queryKey: ["agent-profile"],
    queryFn: () => agentProfileApi.getProfile(),
    refetchInterval: polling ? 3000 : false,
  });

  // Detect balance increase to confirm top-up
  useEffect(() => {
    if (!polling || !profile || balanceBeforeRef.current === null) return;
    if (profile.user.walletBalance > balanceBeforeRef.current) {
      setPolling(false);
      setConfirmed(true);
      queryClient.invalidateQueries({ queryKey: ["agent-profile"] });
    }
  }, [profile?.user.walletBalance, polling, profile, queryClient]);

  const topUp = useMutation({
    mutationFn: () =>
      agentProfileApi.topUp({
        amount: Math.round(parseFloat(amountGHS) * 100),
        payerPhone,
      }),
    onSuccess: () => {
      balanceBeforeRef.current = profile?.user.walletBalance ?? 0;
      setPolling(true);
      toast.success(`MoMo prompt sent to ${payerPhone}, approve to credit wallet`);
    },
    onError: () => toast.error("Failed to initiate top-up. Please try again."),
  });

  const amount = parseFloat(amountGHS);
  const canSubmit = !isNaN(amount) && amount >= 10 && payerPhone.length === 10;

  if (confirmed && profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        <h2 className="text-xl font-bold text-foreground">Wallet topped up!</h2>
        <p className="text-sm text-muted-foreground">New balance</p>
        <p className="text-3xl font-bold text-emerald-500">
          {formatGHS(profile.user.walletBalance)}
        </p>
        <Link
          href="/store/agent/dashboard"
          className="mt-2 text-sm text-emerald-500 hover:text-emerald-400"
        >
          Back to dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/store/agent/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Top up wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Current balance:{" "}
          <span className="font-semibold text-foreground">
            {profile ? formatGHS(profile.user.walletBalance) : "—"}
          </span>
        </p>
      </div>

      {polling ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <Smartphone className="w-9 h-9 text-emerald-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            </div>
          </div>
          <p className="text-base font-semibold text-foreground">Waiting for approval</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Approve the MoMo prompt on{" "}
            <span className="font-mono font-medium text-foreground">{payerPhone}</span>{" "}
            to credit your wallet.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            topUp.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Amount (GHS)
            </label>
            <p className="text-xs text-muted-foreground">Minimum GHS 10</p>
            <input
              type="number"
              inputMode="decimal"
              min="10"
              step="1"
              placeholder="50"
              required
              value={amountGHS}
              onChange={(e) => setAmountGHS(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              MoMo phone number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="0241234567"
              required
              value={payerPhone}
              onChange={(e) => setPayerPhone(formatPhone(e.target.value))}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || topUp.isPending}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm mt-1"
          >
            {topUp.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {topUp.isPending
              ? "Sending prompt…"
              : `Top up ${amountGHS ? formatGHS(parseFloat(amountGHS) * 100) : ""}`}
          </button>
        </form>
      )}
    </div>
  );
}
