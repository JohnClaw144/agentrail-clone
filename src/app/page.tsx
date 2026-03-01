import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FootstepsTrail } from "@/components/FootstepsTrail";
import type { Execution, ExecutionStatus } from "@/types/database";

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const styles: Record<ExecutionStatus, string> = {
    pending:
      "border border-accent/40 text-accent bg-accent-glow",
    completed:
      "bg-foreground text-background",
    failed:
      "bg-failed/10 text-failed border border-failed/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "pending"
            ? "bg-accent animate-pulse-dot"
            : status === "completed"
              ? "bg-background"
              : "bg-failed"
        }`}
      />
      {status}
    </span>
  );
}

function truncateHash(hash: string) {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: Promise<{ status?: ExecutionStatus }>;
}) {
  const params = (await searchParams) ?? {};
  const validStatuses: ExecutionStatus[] = ["pending", "completed", "failed"];
  const statusFilter = params.status && validStatuses.includes(params.status)
    ? params.status
    : null;

  let executions: Execution[] = [];
  let stats = { total: 0, completed: 0, pending: 0 };

  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("executions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;

    executions = (data as Execution[]) ?? [];
    stats = {
      total: executions.length,
      completed: executions.filter((e) => e.status === "completed").length,
      pending: executions.filter((e) => e.status === "pending").length,
    };
  } catch {
    // Supabase may not be configured yet — show empty state
  }

  const filterOptions: { label: string; value: ExecutionStatus | null }[] = [
    { label: "All", value: null },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <FootstepsTrail>
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/footsteps.png"
              alt=""
              width={22}
              height={22}
              className="logo-icon"
            />
            <span className="text-xl font-bold tracking-tight">
              Agen<span className="text-accent">Trail</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground hover:text-accent transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
            >
              Docs
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-surface">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                Base Sepolia
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-8 pt-28 pb-24">
        {/* Subtle gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          <div className="animate-fade-up">
            <div className="inline-block bg-accent px-4 py-2 mb-10">
              <span className="text-[16px] font-bold uppercase tracking-[0.2em] text-foreground">
                Proof-of-Action Layer
              </span>
            </div>
          </div>

          <h1 className="text-[clamp(3rem,8vw,6rem)] font-medium leading-[0.92] tracking-[-0.035em] max-w-4xl animate-fade-up delay-1">
            Immutable receipts
            <br />
            <span className="text-muted">for AI agents.</span>
          </h1>

          <p className="mt-10 max-w-md text-base leading-relaxed text-muted animate-fade-up delay-2">
            Cryptographic proof of exactly what your AI saw and clicked.
            Anchored on-chain. Verifiable forever.
          </p>

          <div className="flex items-center gap-4 mt-10 animate-fade-up delay-3">
            <a
              href="#executions"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-accent transition-all duration-200"
            >
              View Audit Trail
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <span className="text-[11px] text-muted font-mono">
              {stats.total} receipts anchored
            </span>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="overflow-hidden border-y border-border py-4 animate-fade-in delay-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "PROOF-OF-ACTION",
            "SHA-256 HASHING",
            "BASE SEPOLIA",
            "IMMUTABLE RECEIPTS",
            "AI AGENT AUDIT",
            "TINYFISH SSE",
            "ON-CHAIN ANCHORING",
            "ENTERPRISE COMPLIANCE",
            "PROOF-OF-ACTION",
            "SHA-256 HASHING",
            "BASE SEPOLIA",
            "IMMUTABLE RECEIPTS",
            "AI AGENT AUDIT",
            "TINYFISH SSE",
            "ON-CHAIN ANCHORING",
            "ENTERPRISE COMPLIANCE",
          ].map((item, i) => (
            <span
              key={i}
              className="mx-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/60 flex items-center gap-8"
            >
              <span className="h-1 w-1 rounded-full bg-accent/50" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="max-w-6xl mx-auto px-8 animate-fade-up delay-5">
        <section className="grid grid-cols-3">
          {[
            { value: stats.total, label: "Total Executions", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
            { value: stats.completed, label: "Verified On-Chain", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01" },
            { value: stats.pending, label: "Pending Anchor", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`px-8 py-10 ${i < 2 ? "border-r border-border" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-accent/10 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </section>
      </div>

      {/* ── Executions Table ── */}
      <section
        id="executions"
        className="max-w-6xl mx-auto px-8 pt-24 pb-8 animate-fade-up delay-6"
      >
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-2">
              Recent Executions
            </p>
            <h2 className="text-3xl font-medium tracking-tight">
              Audit trail.
            </h2>
          </div>
          <span className="text-[11px] text-muted font-mono">
            {executions.length} records
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => {
            const isActive = option.value === statusFilter || (!option.value && !statusFilter);
            const href = option.value ? `/?status=${option.value}` : "/";
            return (
              <Link
                key={option.label}
                href={href}
                className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] border transition-colors ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted hover:border-foreground/40"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        {executions.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center">
            <div className="h-12 w-12 bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm text-muted mb-2">
              No executions yet.
            </p>
            <p className="text-xs text-muted">
              Send a POST to{" "}
              <code className="font-mono text-foreground bg-surface-raised px-2 py-0.5 rounded border border-border text-[11px]">
                /api/execute
              </code>{" "}
              to create one.
            </p>
          </div>
        ) : (
          <div className="border border-border overflow-hidden bg-surface">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.2fr_0.8fr_1.2fr_0.8fr] gap-4 border-b border-border py-3 px-5 bg-surface-raised">
              {["Goal", "Target", "Status", "PoA Hash", "When"].map(
                (header) => (
                  <span
                    key={header}
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted"
                  >
                    {header}
                  </span>
                )
              )}
            </div>

            {/* Table rows */}
            {executions.map((execution, i) => (
              <Link
                key={execution.id}
                href={`/executions/${execution.id}`}
                className={`grid grid-cols-[2fr_1.2fr_0.8fr_1.2fr_0.8fr] gap-4 py-4 px-5 hover:bg-accent-glow transition-all duration-150 group row-hover ${
                  i < executions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                    {execution.goal}
                  </span>
                  {execution.summary && (
                    <span className="text-[11px] text-muted truncate">
                      {execution.summary}
                    </span>
                  )}
                </span>
                <span className="text-muted truncate font-mono text-xs self-center">
                  {new URL(execution.target_url).hostname}
                </span>
                <div className="self-center">
                  <StatusBadge status={execution.status} />
                </div>
                <span className="font-mono text-xs text-muted self-center hash-truncate">
                  {truncateHash(execution.poa_hash)}
                </span>
                <span className="text-[11px] text-muted self-center">
                  {timeAgo(execution.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/footsteps.png"
              alt=""
              width={14}
              height={14}
              className="logo-icon opacity-40"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">
              AgenTrail &mdash; Proof-of-Action
            </span>
          </div>
          <span className="text-[10px] text-muted font-mono">
            Base Sepolia Testnet
          </span>
        </div>
      </footer>
    </div>
    </FootstepsTrail>
  );
}
