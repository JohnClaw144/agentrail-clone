"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { createOrgAction, issueKeyAction, type ActionState } from "./actions";

const initialState: ActionState = {};

type OrgKey = {
  id: string;
  name: string;
  last_four: string | null;
  revoked: boolean;
  created_at: string;
};

type Org = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  created_at: string;
  org_api_keys: OrgKey[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrgAdminPanel({ orgs }: { orgs: Org[] }) {
  const [createState, createAction] = useFormState(createOrgAction, initialState);
  const [issueState, issueAction] = useFormState(issueKeyAction, initialState);

  useEffect(() => {
    if (createState.success || createState.error) {
      const timer = setTimeout(() => {
        const el = document.getElementById("create-feedback");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [createState]);

  useEffect(() => {
    if (issueState.success || issueState.error) {
      const timer = setTimeout(() => {
        const el = document.getElementById("issue-feedback");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [issueState]);

  return (
    <div className="space-y-10">
      <section className="border border-border bg-surface p-6 rounded-2xl shadow-sm space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Onboarding</p>
          <h2 className="text-2xl font-semibold tracking-tight">Create organization</h2>
        </div>
        <form action={createAction} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted space-y-1">
            Name
            <input
              name="name"
              required
              placeholder="Acme Robotics"
              className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <label className="text-sm text-muted space-y-1">
            Key label
            <input
              name="keyLabel"
              placeholder="Production"
              className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <button
            type="submit"
            className="md:col-span-2 inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-all"
          >
            Create org &amp; issue key
          </button>
        </form>
        <div id="create-feedback" className="space-y-2">
          {createState.error && (
            <p className="text-sm text-failed bg-failed/10 border border-failed/30 px-3 py-2 rounded">
              {createState.error}
            </p>
          )}
          {createState.success && (
            <div className="space-y-2">
              <p className="text-sm text-success bg-success/10 border border-success/30 px-3 py-2 rounded">
                {createState.success}
              </p>
              {createState.apiKey && (
                <div className="text-sm">
                  <p className="text-muted">Copy this API key now — it will not be shown again.</p>
                  <pre className="mt-2 bg-background border border-border px-3 py-2 rounded text-xs overflow-x-auto">
                    {createState.apiKey}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Directory</p>
          <h2 className="text-2xl font-semibold tracking-tight">Organizations</h2>
        </div>
        {orgs.length === 0 ? (
          <p className="text-sm text-muted">No organizations yet. Create one using the form above.</p>
        ) : (
          <div className="space-y-6">
            {orgs.map((org) => (
              <div key={org.id} className="border border-border bg-surface p-5 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                    <p className="text-sm text-muted">Slug: {org.slug ?? "n/a"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{org.status}</span>
                    <p className="text-xs text-muted">Created {formatDate(org.created_at)}</p>
                  </div>
                </div>

                <details className="border border-border rounded-xl">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-foreground">
                    Issue new API key
                  </summary>
                  <div className="p-4 border-t border-border space-y-3">
                    <form action={issueAction} className="space-y-3">
                      <input type="hidden" name="orgId" value={org.id} />
                      <label className="text-sm text-muted space-y-1">
                        Key label
                        <input
                          name="keyLabel"
                          placeholder="Production"
                          className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </label>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-all"
                      >
                        Mint key
                      </button>
                    </form>
                    <div id="issue-feedback" className="space-y-2">
                      {issueState.error && (
                        <p className="text-sm text-failed bg-failed/10 border border-failed/30 px-3 py-2 rounded">
                          {issueState.error}
                        </p>
                      )}
                      {issueState.success && (
                        <div className="space-y-2">
                          <p className="text-sm text-success bg-success/10 border border-success/30 px-3 py-2 rounded">
                            {issueState.success}
                          </p>
                          {issueState.apiKey && (
                            <div className="text-sm">
                              <p className="text-muted">Copy this API key now — it will not be shown again.</p>
                              <pre className="mt-2 bg-background border border-border px-3 py-2 rounded text-xs overflow-x-auto">
                                {issueState.apiKey}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </details>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Issued keys</p>
                  {org.org_api_keys.length === 0 ? (
                    <p className="text-sm text-muted">No keys yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-[0.2em] text-muted">
                            <th className="py-2">Label</th>
                            <th className="py-2">Last four</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {org.org_api_keys.map((key) => (
                            <tr key={key.id} className="border-t border-border text-xs">
                              <td className="py-2 font-medium text-foreground">{key.name}</td>
                              <td className="py-2 font-mono">{key.last_four ?? "----"}</td>
                              <td className="py-2 text-[10px] uppercase tracking-[0.2em]">
                                {key.revoked ? "revoked" : "active"}
                              </td>
                              <td className="py-2 text-muted">{formatDate(key.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
