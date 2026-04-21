"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentProfileApi } from "@/lib/api";
import { formatGHS, formatDateTime } from "@/lib/utils";
import { PaginatedWalletTransactions, WalletTransaction } from "@/model/interface";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const TYPE_STYLES: Record<WalletTransaction["type"], string> = {
  TOPUP: "bg-emerald-500/10 text-emerald-500",
  DEDUCTION: "bg-red-500/10 text-red-500",
  REFUND: "bg-blue-500/10 text-blue-500",
};

export default function WalletTransactionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedWalletTransactions>({
    queryKey: ["agent-transactions", page],
    queryFn: () => agentProfileApi.getTransactions(page),
  });

  const transactions = data?.transactions ?? [];

  return (
    <div className="space-y-5">
      <Link
        href="/store/agent/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data?.total ?? 0} total transactions
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))
          : transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[tx.type]}`}
                  >
                    {tx.type}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      {tx.description ?? tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "TOPUP" || tx.type === "REFUND"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {tx.type === "DEDUCTION" ? "-" : "+"}
                    {formatGHS(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bal: {formatGHS(tx.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
        {!isLoading && transactions.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
            No transactions yet
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.pages}
          </p>
          <div className="flex gap-2">
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
  );
}
