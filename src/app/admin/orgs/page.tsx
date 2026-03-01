import { AppHeader } from "@/components/AppHeader";
import { FootstepsTrail } from "@/components/FootstepsTrail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OrgAdminPanel } from "./OrgAdminPanel";

export const dynamic = "force-dynamic";

type OrgRecord = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  created_at: string;
  org_api_keys: {
    id: string;
    name: string;
    last_four: string | null;
    revoked: boolean;
    created_at: string;
  }[];
};

export default async function AdminOrgsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("orgs")
    .select(
      `id, name, slug, status, created_at,
      org_api_keys (id, name, last_four, revoked, created_at)
    `
    )
    .order("created_at", { ascending: false });

  const orgs = (data as OrgRecord[] | null)?.map((org) => ({
    ...org,
    org_api_keys: [...(org.org_api_keys ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  })) ?? [];

  return (
    <FootstepsTrail>
      <div className="min-h-screen bg-background">
        <AppHeader active="admin" />
        <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-10">
          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Admin Portal
            </p>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-balance">
              Manage organizations &amp; API credentials
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Provision org-specific API keys, monitor issuance history, and onboard new teams without touching the CLI.
            </p>
          </header>

          <OrgAdminPanel orgs={orgs} />
        </main>
      </div>
    </FootstepsTrail>
  );
}
