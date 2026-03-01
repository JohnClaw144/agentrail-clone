import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppHeaderProps {
  active?: "dashboard" | "docs" | "playground";
  chainLabel?: string;
}

export function AppHeader({ active = "dashboard", chainLabel = "Base Sepolia" }: AppHeaderProps) {
  const items: { href: string; label: string; key: "dashboard" | "docs" | "playground" }[] = [
    { href: "/", label: "Dashboard", key: "dashboard" },
    { href: "/docs", label: "Docs", key: "docs" },
    { href: "/playground", label: "Playground", key: "playground" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4 px-6 py-4 md:h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/footsteps.png" alt="" width={20} height={20} className="logo-icon" />
          <span className="text-xl font-bold tracking-tight">
            Agen<span className="text-accent">Trail</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                item.key === active
                  ? "text-foreground"
                  : "hover:text-accent transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-surface">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              {chainLabel}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
