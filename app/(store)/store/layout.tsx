import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Data Bundles | DataHub",
  description:
    "DataHub — Ghana's number one platform to purchase data bundles for MTN, Telecel and AirtelTigo instantly via Mobile Money.",
  openGraph: {
    title: "DataHub — Buy Data Bundles Instantly",
    description:
      "Ghana's number one platform to purchase data bundles for MTN, Telecel and AirtelTigo.",
    type: "website",
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="font-semibold text-sm text-foreground">
              DataHub
            </span>
          </div>
          <a
            href="/store/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Order history
          </a>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DataHub · Instant data bundles
        </p>
      </footer>
    </div>
  );
}
