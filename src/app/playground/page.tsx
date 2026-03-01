import { AppHeader } from "@/components/AppHeader";
import { FootstepsTrail } from "@/components/FootstepsTrail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Execution } from "@/types/database";
import { PlaygroundConsole } from "@/components/PlaygroundConsole";

export default async function PlaygroundPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("executions")
    .select("id, goal, summary, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const executions = (data as Execution[] | null) ?? [];

  return (
    <FootstepsTrail>
      <div className="min-h-screen bg-background">
        <AppHeader active="playground" />
        <header className="border-b border-border py-12">
          <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Interactive Playground
            </p>
            <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold tracking-tight text-balance">
              Test the AgentTrail API in-browser.
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              Paste an organization API key, define the TinyFish goal + target URL, and run a live execution. Responses
              show the proof metadata you can anchor or verify. Nothing is cached—each run is a real call to your stack.
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-10">
          <section className="border border-border bg-surface p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Run an execution</h2>
            <PlaygroundConsole />
          </section>

          <section className="border border-border bg-surface p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Recent receipts</h2>
              <span className="text-[11px] text-muted uppercase tracking-[0.2em]">
                {executions.length} records
              </span>
            </div>
            {executions.length === 0 ? (
              <p className="text-sm text-muted">No executions yet. Run your first call using the form above.</p>
            ) : (
              <div className="divide-y divide-border border border-border">
                {executions.map((execution) => (
                  <div key={execution.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {execution.goal}
                      </span>
                      <span className="text-[11px] text-muted">
                        {new Date(execution.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {execution.summary && (
                      <p className="text-sm text-muted line-clamp-2">{execution.summary}</p>
                    )}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      {execution.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </FootstepsTrail>
  );
}
