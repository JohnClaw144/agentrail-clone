import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VerifyButton } from "@/components/VerifyButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RetryAnchorButton } from "@/components/RetryAnchorButton";
import { revalidatePath } from "next/cache";
import { anchorOnChain } from "@/lib/web3/anchor";
import type { Execution, ExecutionStatus } from "@/types/database";

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const styles: Record<ExecutionStatus, string> = {
    pending: "border border-accent/40 text-accent bg-accent-glow",
    completed: "bg-foreground text-background",
    failed: "bg-failed/10 text-failed border border-failed/20",
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

function MetaRow({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-3.5 border-b border-border last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted self-center shrink-0 w-28">
        {label}
      </span>
      <div className={`text-sm text-right min-w-0 ${mono ? "font-mono text-xs" : ""}`}>
        {children}
      </div>
    </div>
  );
}

async function retryAnchorAction(formData: FormData) {
  "use server";
  const executionId = formData.get("executionId")?.toString();
  const poaHash = formData.get("poaHash")?.toString();
  if (!executionId || !poaHash) return;
  await anchorOnChain(executionId, poaHash);
  revalidatePath(`/executions/${executionId}`);
}

function formatResultJson(
  obj: Record<string, unknown>,
  depth = 0
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      nodes.push(
        <div key={key} className={depth > 0 ? "ml-4" : ""}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
            {key}
          </span>
          {formatResultJson(value as Record<string, unknown>, depth + 1)}
        </div>
      );
    } else {
      nodes.push(
        <div key={key} className={`py-2 ${depth > 0 ? "ml-4" : ""}`}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mr-3">
            {key}
          </span>
          <span className="text-sm">{String(value)}</span>
        </div>
      );
    }
  }
  return nodes;
}

export default async function ExecutionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: execution } = await supabase
    .from("executions")
    .select("*")
    .eq("id", id)
    .single<Execution>();

  if (!execution) {
    notFound();
  }

  const resultJson = execution.result_json;

  const formattedDate = new Date(execution.created_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const truncatedId = `${execution.id.slice(0, 8)}...${execution.id.slice(-4)}`;

  return (
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

          <div className="flex items-center gap-6">
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

      <div className="max-w-6xl mx-auto px-8">
        {/* ── Breadcrumb ── */}
        <div className="pt-8 pb-6 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* ── Header ── */}
        <section className="pb-10 animate-fade-up delay-1">
          <div className="flex items-center gap-3 mb-5">
            <StatusBadge status={execution.status} />
            <span className="text-[11px] text-muted font-mono">{truncatedId}</span>
            <span className="text-muted">&#183;</span>
            <span className="text-[11px] text-muted">{formattedDate}</span>
          </div>
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-medium tracking-tight max-w-2xl leading-tight">
            {execution.goal}
          </h1>
        </section>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-[1fr_360px] gap-12 border-t border-border pt-10 pb-20">
          {/* ─── Left Column ─── */}
          <div className="animate-fade-up delay-2">
            {/* Screenshot */}
            <div className="mb-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted mb-4">
                Agent Screenshot
              </p>
              <div className="border border-border bg-surface overflow-hidden">
                {execution.screenshot_url.includes("supabase") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={execution.screenshot_url}
                    alt={`Screenshot for: ${execution.goal}`}
                    className="w-full h-auto max-h-[480px] object-cover object-top"
                  />
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted mb-3">
                      Screenshot unavailable
                    </p>
                    <a
                      href={execution.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      Visit target &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Result data */}
            {resultJson && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    Extracted Data
                  </p>
                  {execution.proof_url && (
                    <a
                      href={execution.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent hover:underline"
                    >
                      Download Raw JSON
                    </a>
                  )}
                </div>
                <div className="border border-border bg-surface p-6">
                  {formatResultJson(resultJson)}
                </div>
              </div>
            )}

            {/* PoA Hash */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted mb-4">
                SHA-256 Proof-of-Action Hash
              </p>
              <div className="border border-border bg-surface-raised p-5">
                <p className="font-mono text-[13px] break-all leading-relaxed select-all text-foreground/80">
                  {execution.poa_hash}
                </p>
              </div>
              {execution.anchor_error && (
                <div className="mt-4 border border-failed/30 bg-failed/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-failed mb-1">
                    Anchor Error
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {execution.anchor_error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Column ─── */}
          <div className="animate-slide-right delay-3">
            {/* Metadata card */}
            <div className="sticky top-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted mb-4">
                Execution Metadata
              </p>

              <div className="border border-border bg-surface p-5 mb-6">
                <MetaRow label="Receipt ID" mono>
                  {execution.id}
                </MetaRow>

                <MetaRow label="Target URL" mono>
                  <a
                    href={execution.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline break-all"
                  >
                    {execution.target_url}
                  </a>
                </MetaRow>

                {execution.proof_url ? (
                  <MetaRow label="Proof JSON" mono>
                    <a
                      href={execution.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {execution.proof_path ?? execution.proof_url}
                    </a>
                  </MetaRow>
                ) : (
                  <MetaRow label="Proof JSON">
                    <span className="text-xs text-muted">Not captured</span>
                  </MetaRow>
                )}

                <MetaRow label="TX Hash" mono>
                  {execution.tx_hash ? (
                    <a
                      href={`https://sepolia.basescan.org/tx/${execution.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all inline-flex items-center gap-1"
                    >
                      {`${execution.tx_hash.slice(0, 10)}...${execution.tx_hash.slice(-6)}`}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-muted italic text-xs">
                      Pending anchor...
                    </span>
                  )}
                </MetaRow>

                <MetaRow label="Status">
                  <StatusBadge status={execution.status} />
                </MetaRow>

                <MetaRow label="Executed At">
                  <span className="text-xs">{formattedDate}</span>
                </MetaRow>
              </div>

              {/* Verify Section */}
              <VerifyButton executionId={execution.id} />

              {execution.status !== "completed" && (
                <div className="mt-6 space-y-3">
                  <form action={retryAnchorAction} className="space-y-3">
                    <input type="hidden" name="executionId" value={execution.id} />
                    <input type="hidden" name="poaHash" value={execution.poa_hash} />
                    <RetryAnchorButton />
                  </form>
                  <p className="text-[10px] text-muted uppercase tracking-[0.15em]">
                    Re-queues the Base Sepolia transaction in case an earlier attempt failed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
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
  );
}
