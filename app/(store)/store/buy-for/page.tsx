"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { detectNetwork, formatPhone } from "@/lib/utils";

export default function BuyForPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const detectedNetwork = phone.length >= 3 ? detectNetwork(phone) : null;
  const isValid = phone.length === 10 && buyerPhone.length === 10;

  function handleContinue() {
    if (!isValid) return;
    const network = detectedNetwork ?? "MTN";
    router.push(
      `/store/buy?network=${network}&recipient=${phone}&buyer=${buyerPhone}`,
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/store"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buy for someone</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the recipient&apos;s number and we&apos;ll detect their network
          automatically.
        </p>
      </div>

      <div className="space-y-4">
        {/* Recipient phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Recipient&apos;s phone number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="0241234567"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          {detectedNetwork && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Detected: {detectedNetwork}
            </p>
          )}
          {phone.length >= 3 && !detectedNetwork && (
            <p className="text-xs text-muted-foreground">
              Network not detected — you&apos;ll select it manually
            </p>
          )}
        </div>

        {/* Buyer phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Your phone number
          </label>
          <p className="text-xs text-muted-foreground">
            This is the number that will be charged via MoMo
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

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
