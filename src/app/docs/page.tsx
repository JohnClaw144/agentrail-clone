import Link from "next/link";

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
  "result_json": { ... }
}`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">AgentTrail</p>
          <h1 className="text-4xl font-semibold tracking-tight">API Reference</h1>
          <p className="text-sm text-muted max-w-2xl">
            Multi-tenant REST endpoints for orchestrating Proof-of-Action receipts. Pair with the Postman collection
            and the Node SDK for faster integrations.
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em]">
            <Link href="/" className="text-muted hover:text-accent">
              Dashboard
            </Link>
            <a
              href="https://github.com/JohnClaw144/agentrail-clone/blob/main/docs/API.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent"
            >
              Raw Markdown
            </a>
            <a href="/postman/agenttrail.postman_collection.json" className="text-muted hover:text-accent">
              Download Postman
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <section className="border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Authentication</h2>
          <p className="text-sm text-muted">
            Include your organization API key on every request.
          </p>
          <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto">
            <code>
{`Authorization: Bearer <api-key>
# or
X-AgentTrail-Key: <api-key>`}
            </code>
          </pre>
          <p className="text-sm text-muted">
            Generate keys with <code className="px-1 py-0.5 bg-surface-raised border border-border text-[11px]">npm run create:org &quot;Acme&quot;</code>
            and store the plaintext output securely.
          </p>
        </section>

        <section className="border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">POST /api/execute</h2>
          <p className="text-sm text-muted">
            Creates a new Proof-of-Action receipt by proxying TinyFish browser automation.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Request Body</p>
              <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto">
                {REQUEST_SNIPPET}
              </pre>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Response</p>
              <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto">
                {RESPONSE_SNIPPET}
              </pre>
            </div>
          </div>
        </section>

        <section className="border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">GET /api/executions</h2>
          <p className="text-sm text-muted">
            Returns the latest 50 executions for your org, ordered by <code>created_at</code> descending.
          </p>
        </section>

        <section className="border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">POST /api/executions/:id/anchor</h2>
          <p className="text-sm text-muted">
            Re-queues the Base Sepolia transaction for a given receipt if an earlier attempt failed.
          </p>
        </section>
      </main>
    </div>
  );
}
