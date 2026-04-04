"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

const breadcrumbMap: Record<string, string> = {
  orders: "Orders",
  bundles: "Bundles",
  payments: "Payments",
  fulfillment: "Fulfillment",
  users: "Users",
  ussd: "USSD Sessions",
  "audit-logs": "Audit Logs",
  settings: "Settings",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="font-semibold text-foreground">Overview</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const label = breadcrumbMap[seg] ?? seg;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span
              className={
                isLast
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 text-[10px] flex items-center justify-center">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
