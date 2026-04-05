import Link from "next/link";
import { Zap, Users, Clock } from "lucide-react";
import { NETWORKS } from "@/lib/utils";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant delivery",
    desc: "Data credited within seconds of payment",
  },
  {
    icon: Users,
    title: "Buy for anyone",
    desc: "Send data to any number on any network",
  },
  {
    icon: Clock,
    title: "Track your order",
    desc: "Real-time status updates on every purchase",
  },
];

export default function StorePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
          <Zap className="w-3 h-3" />
          Instant data bundles
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Buy data bundles
          <br />
          in seconds
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Affordable bundles for MTN, Telecel and AirtelTigo. Pay with Mobile
          Money.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="space-y-3">
        <Link
          href="/store/buy"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Zap className="w-4 h-4" />
          Buy data for myself
        </Link>
        <Link
          href="/store/buy-for"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-card hover:bg-muted border border-border text-foreground font-medium rounded-xl transition-colors text-sm"
        >
          <Users className="w-4 h-4" />
          Buy for someone else
        </Link>
      </div>

      {/* Network cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Browse by network
        </p>
        <div className="grid grid-cols-3 gap-3">
          {NETWORKS.map((n) => (
            <Link
              key={n.name}
              href={n.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${n.borderColor} ${n.bgColor} hover:scale-[1.02] active:scale-[0.98] transition-transform`}
            >
              <div
                className={`w-8 h-8 rounded-full ${n.color} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {n.name[0]}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground">
                {n.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order history link */}
      <div className="text-center pb-2">
        <Link
          href="/store/orders"
          className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          View past orders →
        </Link>
      </div>
    </div>
  );
}
