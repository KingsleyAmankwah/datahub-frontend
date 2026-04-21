"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { agentProfileApi } from "@/lib/api";
import { clearAgentAuth, getAgentToken } from "@/lib/agent-auth";
import { formatGHS } from "@/lib/utils";
import { Agent } from "@/model/interface";
import { LogOut, Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/store/agent/login", "/store/agent/register"];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublic) {
      setLoading(false);
      return;
    }
    if (!getAgentToken()) {
      router.replace("/store/agent/login");
      return;
    }
    agentProfileApi
      .getProfile()
      .then(setProfile)
      .catch(() => {
        clearAgentAuth();
        router.replace("/store/agent/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, isPublic, router]);

  function handleLogout() {
    clearAgentAuth();
    router.push("/store/agent/login");
  }

  if (!isPublic && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isPublic && profile && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <span className="font-semibold text-sm text-foreground truncate">
              {profile.businessName}
            </span>
            <div className="flex flex-col items-center shrink-0">
              <span className="text-xs text-muted-foreground">Wallet</span>
              <span className="text-sm font-bold text-emerald-500">
                {formatGHS(profile.user.walletBalance)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
