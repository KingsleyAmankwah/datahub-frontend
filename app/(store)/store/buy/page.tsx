"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bundlesApi, ordersApi } from "@/lib/api";
import { formatGHS } from "@/lib/utils";
import { ArrowLeft, Phone, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Network } from "@/model/types";
import { Bundle } from "@/model/interface";

const NETWORKS: { value: Network; label: string; color: string }[] = [
  { value: "MTN", label: "MTN", color: "bg-yellow-400" },
  { value: "TELECEL", label: "Telecel", color: "bg-red-500" },
  { value: "AIRTELTIGO", label: "AirtelTigo", color: "bg-blue-500" },
];

function formatPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function formatData(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(0)}GB` : `${mb}MB`;
}

function BuyPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const initialNetwork = (params.get("network") as Network) ?? "MTN";
  const recipientFromUrl = params.get("recipient") ?? "";
  const buyerFromUrl = params.get("buyer") ?? "";

  const [network, setNetwork] = useState<Network>(initialNetwork);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [buyerPhone, setBuyerPhone] = useState(buyerFromUrl);
  const [recipientPhone] = useState(recipientFromUrl);

  // recipient is either from URL (buy-for flow) or same as buyer (self)
  const isBuyForSomeone = !!recipientFromUrl;
  const effectiveRecipient = isBuyForSomeone ? recipientPhone : buyerPhone;

  const { data, isLoading } = useQuery({
    queryKey: ["bundles", "store", network],
    queryFn: () => bundlesApi.getAll(network),
  });

  const bundles = data ?? [];

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        bundleId: selectedBundle!.id,
        buyerPhone,
        recipientPhone: effectiveRecipient,
      }),
    onSuccess: (order) => {
      sessionStorage.setItem("order_lookup_ref", order.reference);
      sessionStorage.setItem("order_lookup_phone", buyerPhone);
      router.push(`/store/payment/${order.id}`);
    },
    onError: () => toast.error("Failed to place order. Please try again."),
  });

  const canSubmit =
    selectedBundle !== null &&
    buyerPhone.length === 10 &&
    effectiveRecipient.length === 10;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={isBuyForSomeone ? "/store/buy-for" : "/store"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isBuyForSomeone ? `Buying for ${recipientPhone}` : "Buy data"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a network and choose your bundle
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
              <div
                className={`w-7 h-7 rounded-full ${n.color} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {n.label[0]}
                </span>
              </div>
              <span className="text-xs font-medium text-foreground">
                {n.label}
              </span>
              {network === n.value && (
                <Check className="w-3 h-3 text-emerald-500 -mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bundle list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Choose a bundle
        </p>
        {isLoading ? (
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
              return (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {bundle.dataMb ? formatData(bundle.dataMb) : bundle.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Valid for {bundle.validityDays} day
                      {bundle.validityDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-foreground">
                      {formatGHS(bundle.sellingPrice)}
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

      {/* Buyer phone — always needed for MoMo charge */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          {isBuyForSomeone ? "Your MoMo number" : "Your phone number"}
        </label>
        <p className="text-xs text-muted-foreground">
          {isBuyForSomeone
            ? "The number that will be charged"
            : "Data will be sent to this number"}
        </p>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            inputMode="numeric"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(formatPhone(e.target.value))}
            placeholder="0241234567"
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      {/* Order summary */}
      {selectedBundle && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order summary
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bundle</span>
            <span className="text-foreground font-medium">
              {selectedBundle.dataMb
                ? formatData(selectedBundle.dataMb)
                : selectedBundle.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span className="text-foreground font-medium">{network}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span className="text-foreground font-medium font-mono">
              {effectiveRecipient || "—"}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-emerald-500">
              {formatGHS(selectedBundle.sellingPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => createOrder.mutate()}
        disabled={!canSubmit || createOrder.isPending}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {createOrder.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing order...
          </>
        ) : (
          `Pay ${selectedBundle ? formatGHS(selectedBundle.sellingPrice) : ""}`
        )}
      </button>
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense>
      <BuyPageInner />
    </Suspense>
  );
}
