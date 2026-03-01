"use client";

import { useState } from "react";

export function PlaygroundConsole() {
  const [apiKey, setApiKey] = useState("");
  const [goal, setGoal] = useState("Capture hero headline");
  const [url, setUrl] = useState("https://example.com");
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({ goal, url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Request failed");
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted">
          API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Bearer token"
            className="w-full border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          Target URL
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-muted">
        Goal / Prompt
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="w-full border border-border bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          required
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-all disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Running..." : "Run TinyFish"}
      </button>
      {error && (
        <p className="text-sm text-failed bg-failed/10 border border-failed/30 px-3 py-2">{error}</p>
      )}
      {response && (
        <pre className="text-xs bg-surface-raised border border-border p-4 overflow-x-auto max-h-72 rounded-xl">
{response}
        </pre>
      )}
    </form>
  );
}
