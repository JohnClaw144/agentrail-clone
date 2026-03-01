import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FootstepsTrail } from "@/components/FootstepsTrail";

const REQUEST_SNIPPET = `{
  "goal": "Extract the hero headline",
  "url": "https://example.com"
}`;

const RESPONSE_SNIPPET = `{
  "receipt_id": "uuid",
  "status": "pending",
  "poa_hash": "sha256...",
  "screenshot_url": "https://...",
  "proof_url": "https://...",
  "summary": "Agent captured the Coinbase hero and extracted price $63,481.08",
  "result_json": { ... }
}`;

const RESPONSE_SNIPPET = `{
  "receipt_id": "uuid",
  "status": "pending",
  "poa_hash": "sha256...",
  "screenshot_url": "https://...",
  "proof_url": "https://...",
  "summary": "Agent captured the Coinbase hero and extracted price $63,481.08",
  "result_json": { ... }
}`;

export default function DocsPage() {
  return (
    <FootstepsTrail>
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4 px-6 py-4 md:h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/footsteps.png" alt="" width={20} height={20} className="logo-icon" />
              <span className="text-xl font-bold tracking-tight">
                Agen<span className="text-accent">Trail</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
              <Link href="/" className="hover:text-accent transition-colors">
                Dashboard
              </Link>
              <a
                href="https://github.com/JohnClaw144/agentrail-clone/blob/main/docs/API.md"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Markdown
              </a>
              <a href="/postman/agenttrail.postman_collection.json" className="hover:text-accent transition-colors">
                Postman
              </a>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <header className="border-b border-border py-14 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden>
            <div className="w-[600px] h-[600px] bg-accent/20 rounded-full blur-[160px] -translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-5 relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">API Reference</p>
            <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-semibold tracking-tight text-balance">
              Verifiable receipts by API.
            </h1>
            <p className="text-sm text-muted max-w-2xl leading-relaxed text-balance">
              Multi-tenant REST endpoints that proxy TinyFish automations, anchor hashes on Base Sepolia, and now add
              Gemini-powered AI summaries. Authenticate with org-specific API keys and wire the responses directly into
              your compliance stack.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="px-3 py-1 border border-border">REST</span>
              <span className="px-3 py-1 border border-border">JSON</span>
              <span className="px-3 py-1 border border-border">AI Summaries</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-10">
          <section className="border border-border bg-surface p-6 space-y-4 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">Authentication</h2>
            <p className="text-sm text-muted">Include your organization API key on every request.</p>
            <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto rounded-xl">
              <code>
{`Authorization: Bearer <api-key>
# or
X-AgentTrail-Key: <api-key>`}
              </code>
            </pre>
            <p className="text-sm text-muted">
              Generate keys with <code className="px-1 py-0.5 bg-surface-raised border border-border text-[11px]">npm run create:org &quot;Acme&quot;</code>
              and store the plaintext output securely. Keys can be revoked per org without affecting others.
            </p>
          </section>

          <section className="border border-border bg-surface p-6 space-y-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">POST /api/execute</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Creates receipt</span>
            </div>
            <p className="text-sm text-muted">
              Sends a TinyFish automation task, stores the proof payload in Supabase, anchors the SHA-256 hash on Base,
              and generates a Replicate summary.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Request Body</p>
                <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto rounded-xl">
                  {REQUEST_SNIPPET}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Response</p>
                <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto rounded-xl">
                  {RESPONSE_SNIPPET}
                </pre>
              </div>
            </div>
            <ul className="text-sm text-muted space-y-2 list-disc pl-5">
              <li>
                <code>summary</code> — AI-written recap powered by Google Gemini 2.5 Flash via Replicate.
              </li>
              <li>
                <code>result_json</code> — Raw TinyFish data you can re-hash to verify immutability.
              </li>
              <li>
                <code>proof_url</code> / <code>screenshot_url</code> — public Supabase assets for long-term audits.
              </li>
            </ul>
          </section>

          <section className="border border-border bg-surface p-6 space-y-3 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">GET /api/executions</h2>
            <p className="text-sm text-muted">
              Returns the latest 50 executions for your org, ordered by <code>created_at</code> descending. Includes the
              stored summary, Supabase pointers, and status metadata.
            </p>
          </section>

          <section className="border border-border bg-surface p-6 space-y-3 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">POST /api/executions/:id/anchor</h2>
            <p className="text-sm text-muted">
              Re-queues the Base Sepolia transaction for a given receipt if an earlier attempt failed. Useful when RPC
              hiccups left a receipt in <code>pending</code> or <code>failed</code> state.
            </p>
          </section>
        </main>

        <footer className="border-t border-border py-8 mt-12">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> API uptime obsesses us.
            </div>
            <div className="text-[10px] text-muted font-mono">
              Need help? Drop a note via dashboard → Docs.
            </div>
          </div>
        </footer>
      </div>
    </FootstepsTrail>
  );
}
