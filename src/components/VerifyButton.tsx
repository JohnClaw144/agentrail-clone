"use client";

import { useState, useEffect, useCallback } from "react";

interface VerifyResult {
  verified: boolean;
  on_chain_hash: string | null;
  stored_hash: string;
  recomputed_hash: string | null;
  tx_hash: string | null;
  block_number: number | null;
  contract_address: string | null;
  chain: string;
  error?: string;
}

type Step =
  | "idle"
  | "fetching"
  | "chain_reveal"
  | "db_reveal"
  | "recompute_reveal"
  | "comparing"
  | "result"
  | "error";

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 transition-all duration-500"
      style={{ opacity: active || completed ? 1 : 0.3 }}
    >
      <div
        className={`h-6 w-6 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
          completed
            ? "bg-accent text-white"
            : active
              ? "border border-accent text-accent"
              : "border border-border text-muted"
        }`}
      >
        {completed ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          step
        )}
      </div>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 ${
          active ? "text-accent" : completed ? "text-foreground" : "text-muted"
        }`}
      >
        {label}
      </span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
      )}
    </div>
  );
}

export function VerifyButton({ executionId }: { executionId: string }) {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [revealedChainChars, setRevealedChainChars] = useState(0);
  const [revealedDbChars, setRevealedDbChars] = useState(0);
  const [revealedRecomputeChars, setRevealedRecomputeChars] = useState(0);
  const [compareProgress, setCompareProgress] = useState(0);

  const hasRecomputed = !!result?.recomputed_hash;

  // Typewriter: chain hash
  useEffect(() => {
    if (step !== "chain_reveal" || !result?.on_chain_hash) return;
    const len = result.on_chain_hash.length;
    if (revealedChainChars >= len) {
      const t = setTimeout(() => setStep("db_reveal"), 400);
      return () => clearTimeout(t);
    }
    const speed = Math.max(4, 18 - Math.floor(revealedChainChars / 8));
    const t = setTimeout(() => setRevealedChainChars((p) => Math.min(p + 2, len)), speed);
    return () => clearTimeout(t);
  }, [step, revealedChainChars, result]);

  // Typewriter: DB hash
  useEffect(() => {
    if (step !== "db_reveal" || !result?.stored_hash) return;
    const len = result.stored_hash.length;
    if (revealedDbChars >= len) {
      const next = hasRecomputed ? "recompute_reveal" : "comparing";
      const t = setTimeout(() => setStep(next), 400);
      return () => clearTimeout(t);
    }
    const speed = Math.max(4, 18 - Math.floor(revealedDbChars / 8));
    const t = setTimeout(() => setRevealedDbChars((p) => Math.min(p + 2, len)), speed);
    return () => clearTimeout(t);
  }, [step, revealedDbChars, result, hasRecomputed]);

  // Typewriter: recomputed hash
  useEffect(() => {
    if (step !== "recompute_reveal" || !result?.recomputed_hash) return;
    const len = result.recomputed_hash.length;
    if (revealedRecomputeChars >= len) {
      const t = setTimeout(() => setStep("comparing"), 400);
      return () => clearTimeout(t);
    }
    const speed = Math.max(4, 18 - Math.floor(revealedRecomputeChars / 8));
    const t = setTimeout(() => setRevealedRecomputeChars((p) => Math.min(p + 2, len)), speed);
    return () => clearTimeout(t);
  }, [step, revealedRecomputeChars, result]);

  // Character-by-character comparison sweep
  useEffect(() => {
    if (step !== "comparing" || !result?.on_chain_hash) return;
    const len = result.on_chain_hash.length;
    if (compareProgress >= len) {
      const t = setTimeout(() => setStep("result"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompareProgress((p) => Math.min(p + 1, len)), 18);
    return () => clearTimeout(t);
  }, [step, compareProgress, result]);

  const handleVerify = useCallback(async () => {
    setStep("fetching");
    setRevealedChainChars(0);
    setRevealedDbChars(0);
    setRevealedRecomputeChars(0);
    setCompareProgress(0);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${executionId}`, { method: "POST" });
      const data: VerifyResult = await res.json();

      if (!res.ok || data.error) {
        setResult(data);
        setStep("error");
        return;
      }

      setResult(data);
      setTimeout(() => setStep("chain_reveal"), 300);
    } catch {
      setStep("error");
    }
  }, [executionId]);

  // ── Idle ──
  if (step === "idle") {
    return (
      <button
        onClick={handleVerify}
        className="w-full bg-foreground text-surface px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-all duration-200 cursor-pointer group flex items-center justify-center gap-3"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Verify On-Chain
      </button>
    );
  }

  // ── Error ──
  if (step === "error") {
    return (
      <div className="border border-failed/30 bg-failed/5 p-5">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-failed">
          Verification Failed
        </span>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          {result?.error ?? "Could not reach the blockchain. Try again."}
        </p>
        <button
          onClick={handleVerify}
          className="mt-3 text-[11px] font-medium uppercase tracking-[0.15em] text-accent hover:underline cursor-pointer"
        >
          Retry &rarr;
        </button>
      </div>
    );
  }

  // ── Step booleans ──
  const pastChain = step !== "fetching" && step !== "chain_reveal";
  const pastDb = pastChain && step !== "db_reveal";
  const pastRecompute = pastDb && step !== "recompute_reveal";
  const isComparing = step === "comparing";
  const isDone = step === "result";

  const totalSteps = hasRecomputed ? 4 : 3;

  return (
    <div className="border border-border bg-surface overflow-hidden verify-panel">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-surface-raised flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
            Proof Verification
          </span>
        </div>
        {result?.chain && (
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
            {result.chain}
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="px-5 py-4 space-y-3 border-b border-border">
        <StepIndicator
          step={1}
          label="Read blockchain"
          active={step === "fetching" || step === "chain_reveal"}
          completed={pastChain}
        />
        <StepIndicator
          step={2}
          label="Read database"
          active={step === "db_reveal"}
          completed={pastDb}
        />
        {hasRecomputed && (
          <StepIndicator
            step={3}
            label="Recompute from raw data"
            active={step === "recompute_reveal"}
            completed={pastRecompute}
          />
        )}
        <StepIndicator
          step={totalSteps}
          label="Compare hashes"
          active={isComparing}
          completed={isDone}
        />
      </div>

      {/* Fetching spinner */}
      {step === "fetching" && (
        <div className="px-5 py-6 flex items-center justify-center gap-3">
          <span className="h-3 w-3 rounded-full border-2 border-muted border-t-accent animate-spin" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
            Querying Base Sepolia...
          </span>
        </div>
      )}

      {/* ── Hash 1: On-Chain ── */}
      {(step === "chain_reveal" || pastChain) && result?.on_chain_hash && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-1.5 w-1.5 bg-accent" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
              On-Chain Hash
            </span>
            {result.block_number && (
              <span className="text-[9px] font-mono text-muted ml-auto">
                Block #{result.block_number.toLocaleString()}
              </span>
            )}
          </div>
          <div className="bg-surface-raised border border-border p-3">
            <HashDisplay
              hash={result.on_chain_hash}
              revealed={step === "chain_reveal" ? revealedChainChars : result.on_chain_hash.length}
              showCursor={step === "chain_reveal"}
              compareWith={result.stored_hash}
              compareProgress={isComparing || isDone ? (isDone ? result.on_chain_hash.length : compareProgress) : 0}
              isComparing={isComparing || isDone}
            />
          </div>
        </div>
      )}

      {/* ── Hash 2: Stored (DB) ── */}
      {(step === "db_reveal" || pastDb) && result?.stored_hash && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-1.5 w-1.5 bg-foreground/40" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
              Stored Hash
            </span>
            <span className="text-[9px] font-mono text-muted ml-auto">
              Supabase
            </span>
          </div>
          <div className="bg-surface-raised border border-border p-3">
            <HashDisplay
              hash={result.stored_hash}
              revealed={step === "db_reveal" ? revealedDbChars : result.stored_hash.length}
              showCursor={step === "db_reveal"}
              compareWith={result.on_chain_hash}
              compareProgress={isComparing || isDone ? (isDone ? result.stored_hash.length : compareProgress) : 0}
              isComparing={isComparing || isDone}
            />
          </div>
        </div>
      )}

      {/* ── Hash 3: Recomputed ── */}
      {hasRecomputed && (step === "recompute_reveal" || pastRecompute) && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-1.5 w-1.5 bg-foreground/40" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
              Recomputed Hash
            </span>
            <span className="text-[9px] font-mono text-muted ml-auto">
              SHA-256
            </span>
          </div>
          <div className="bg-surface-raised border border-border p-3">
            <HashDisplay
              hash={result!.recomputed_hash!}
              revealed={step === "recompute_reveal" ? revealedRecomputeChars : result!.recomputed_hash!.length}
              showCursor={step === "recompute_reveal"}
              compareWith={result!.on_chain_hash}
              compareProgress={isComparing || isDone ? (isDone ? result!.recomputed_hash!.length : compareProgress) : 0}
              isComparing={isComparing || isDone}
            />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {isDone && result && (
        <div className={`px-5 py-5 ${result.verified ? "bg-accent-glow" : "bg-failed/5"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.verified ? (
              <>
                <div className="h-8 w-8 bg-accent flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11.5 14.5 16 9.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                    Verified — {hasRecomputed ? "3/3" : "2/2"} hashes match
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Immutable and tamper-proof
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="h-8 w-8 bg-failed flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-failed">
                    Mismatch Detected
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Data may have been tampered with
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            {result.tx_hash && (
              <a
                href={`https://sepolia.basescan.org/tx/${result.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
              >
                BaseScan
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
            {result.contract_address && (
              <a
                href={`https://sepolia.basescan.org/address/${result.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-accent hover:underline"
              >
                Contract
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
            <button
              onClick={handleVerify}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted hover:text-accent ml-auto cursor-pointer"
            >
              Re-verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Renders a hash with typewriter reveal + comparison coloring */
function HashDisplay({
  hash,
  revealed,
  showCursor,
  compareWith,
  compareProgress,
  isComparing,
}: {
  hash: string;
  revealed: number;
  showCursor: boolean;
  compareWith: string | null;
  compareProgress: number;
  isComparing: boolean;
}) {
  return (
    <span className="font-mono text-[11px] leading-relaxed break-all">
      {hash.split("").map((char, i) => {
        // Not yet revealed by typewriter
        if (i >= revealed) return null;

        // During comparison phase
        if (isComparing && compareWith) {
          const checked = compareProgress;
          if (i >= checked) {
            return (
              <span key={i} className="text-foreground/30">{char}</span>
            );
          }
          const matches = char === compareWith[i];
          return (
            <span
              key={i}
              className={`transition-colors duration-100 ${
                matches ? "text-accent" : "text-failed font-bold"
              }`}
            >
              {char}
            </span>
          );
        }

        // Normal reveal
        return (
          <span key={i} className="text-foreground/70">{char}</span>
        );
      })}
      {showCursor && (
        <span className="inline-block w-[2px] h-[14px] bg-accent ml-0.5 align-middle animate-pulse-dot" />
      )}
    </span>
  );
}
