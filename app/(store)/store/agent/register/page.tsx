"use client";

import { useState } from "react";
import { agentAuthApi } from "@/lib/api";
import { formatPhone } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AgentRegisterPage() {
  const [fields, setFields] = useState({
    businessName: "",
    name: "",
    phoneNumber: "",
    pin: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await agentAuthApi.register(fields);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg.includes("409") ? "An account already exists for this phone number" : msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        <h2 className="text-xl font-bold text-foreground">Application submitted!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          You&apos;ll be notified once your account is approved. You can then log in with your phone number and PIN.
        </p>
        <Link
          href="/store/agent/login"
          className="mt-2 text-sm text-emerald-500 hover:text-emerald-400"
        >
          Go to login →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-sm font-bold">BB</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Become an Agent</h1>
        <p className="text-sm text-muted-foreground">Fill in your details to apply</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(
          [
            { key: "businessName", label: "Business name", placeholder: "Kofi Data Hub", type: "text" },
            { key: "name", label: "Your full name", placeholder: "Kofi Mensah", type: "text" },
            { key: "phoneNumber", label: "Phone number", placeholder: "0241234567", type: "tel" },
            { key: "pin", label: "PIN", placeholder: "Choose a 4-digit PIN", type: "password" },
          ] as const
        ).map(({ key, label, placeholder, type }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <input
              type={type}
              inputMode={type === "tel" || key === "pin" ? "numeric" : undefined}
              placeholder={placeholder}
              required
              value={fields[key]}
              onChange={(e) =>
                setFields((f) => ({
                  ...f,
                  [key]: key === "phoneNumber" ? formatPhone(e.target.value) : e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={
            loading ||
            !fields.businessName ||
            !fields.name ||
            fields.phoneNumber.length < 10 ||
            !fields.pin
          }
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Submitting…" : "Submit application"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/store/agent/login" className="text-emerald-500 hover:text-emerald-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
