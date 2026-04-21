"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agentAuthApi } from "@/lib/api";
import { setAgentToken } from "@/lib/agent-auth";
import { formatPhone } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AgentLoginPage() {
  const router = useRouter();
  const [fields, setFields] = useState({ phoneNumber: "", pin: "" });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { accessToken } = await agentAuthApi.login(fields);
      setAgentToken(accessToken);
      router.push("/store/agent/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-sm font-bold">BB</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Agent Login</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your agent account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Phone number
          </label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="0241234567"
            required
            value={fields.phoneNumber}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                phoneNumber: formatPhone(e.target.value),
              }))
            }
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">PIN</label>
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              placeholder="••••"
              required
              value={fields.pin}
              onChange={(e) =>
                setFields((f) => ({ ...f, pin: e.target.value }))
              }
              className="w-full px-4 py-3 pr-11 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPin ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || fields.phoneNumber.length < 10 || !fields.pin}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/store/agent/register"
          className="text-emerald-500 hover:text-emerald-400"
        >
          Apply as agent
        </Link>
      </p>
    </div>
  );
}
