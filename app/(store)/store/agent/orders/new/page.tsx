"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { bundlesApi, agentProfileApi, agentOrdersApi } from "@/lib/api";
import { formatGHS, formatPhone, detectNetwork } from "@/lib/utils";
import { Agent, Bundle } from "@/model/interface";
import { Network } from "@/model/types";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Wallet } from "lucide-react";
import Link from "next/link";

const NETWORKS: { value: Network; label: string; color: string }[] = [
  { value: "MTN", label: "MTN", color: "bg-yellow-400" },
  { value: "TELECEL", label: "Telecel", color: "bg-red-500" },
  { value: "AIRTELTIGO", label: "AirtelTigo", color: "bg-blue-500" },
];

function formatData(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(0)}GB` : `${mb}MB`;
}

export default function AgentNewOrderPage() {
  const router = useRouter();
  const [network, setNetwork] = useState<Network>("MTN");
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [recipientPhone, setRecipientPhone] = useState("");

  const { data: profile } = useQuery<Agent>({
    queryKey: ["agent-profile"],
    queryFn: () => agentProfileApi.getProfile(),
  });

  const { data: bundles = [], isLoading: bundlesLoading } = useQuery<Bundle[]>({
    queryKey: ["bundles", "agent", network],
    queryFn: () => bundlesApi.getAll(network),
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      agentOrdersApi.place({
        bundleId: selectedBundle!.id,
        recipientPhone,
        recipientNetwork: network,
      }),
    onSuccess: (order) => {
      router.push(`/store/agent/orders/${order.id}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      if (msg.includes("400")) {
        toast.error("Insufficient wallet balance. Please top up first.");
      } else {
        toast.error(msg);
      }
    },
  });

  const walletBalance = profile?.user.walletBalance ?? 0;
  const cost = selectedBundle?.costPrice ?? 0;
  const insufficientBalance = selectedBundle !== null && walletBalance < cost;
  const canSubmit =
    selectedBundle !== null &&
    recipientPhone.length === 10 &&
    !insufficientBalance;

  // Auto-detect network from phone
  const detectedNetwork = detectNetwork(recipientPhone);

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
        <h1 className="text-2xl font-bold text-foreground">Place order</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Wallet:{" "}
          <span className="font-semibold text-foreground">
            {formatGHS(walletBalance)}
          </span>
        </p>
      </div>

      {/* Network selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Network
        </p>
        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.value}
              onClick={() => {
                setNetwork(n.value);
                setSelectedBundle(null);
              }}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                network === n.value
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className={`w-7 h-7 rounded-full ${n.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{n.label[0]}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{n.label}</span>
              {network === n.value && <Check className="w-3 h-3 text-emerald-500 -mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Bundle list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Choose a bundle
        </p>
        {bundlesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
            No bundles available for {network}
          </div>
        ) : (
          <div className="space-y-2">
            {bundles.map((bundle) => {
              const isSelected = selectedBundle?.id === bundle.id;
              const affordable = walletBalance >= bundle.costPrice;
              return (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-card hover:bg-muted"
                  } ${!affordable ? "opacity-50" : ""}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {bundle.dataMb ? formatData(bundle.dataMb) : bundle.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bundle.validityDays} day{bundle.validityDays !== 1 ? "s" : ""}
                      {!affordable && " · Insufficient balance"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-foreground">
                      {formatGHS(bundle.costPrice)}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Recipient phone number
        </label>
        {detectedNetwork && recipientPhone.length >= 3 && (
          <p className="text-xs text-emerald-500">Detected: {detectedNetwork}</p>
        )}
        <input
          type="tel"
          inputMode="numeric"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(formatPhone(e.target.value))}
          placeholder="0241234567"
          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {/* Insufficient balance warning */}
      {insufficientBalance && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Wallet className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Insufficient balance. You need {formatGHS(cost)} but have{" "}
            {formatGHS(walletBalance)}.{" "}
            <Link href="/store/agent/wallet/topup" className="underline font-medium">
              Top up
            </Link>
          </p>
        </div>
      )}

      {/* Order summary */}
      {selectedBundle && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order summary
          </p>
          {[
            { label: "Bundle", value: selectedBundle.dataMb ? formatData(selectedBundle.dataMb) : selectedBundle.name },
            { label: "Network", value: network },
            { label: "Recipient", value: recipientPhone || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-medium font-mono">{value}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm font-semibold text-foreground">Cost</span>
            <span className="text-base font-bold text-emerald-500">
              {formatGHS(selectedBundle.costPrice)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={() => placeOrder.mutate()}
        disabled={!canSubmit || placeOrder.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {placeOrder.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing order…
          </>
        ) : (
          `Place order${selectedBundle ? ` · ${formatGHS(selectedBundle.costPrice)}` : ""}`
        )}
      </button>
    </div>
  );
}
