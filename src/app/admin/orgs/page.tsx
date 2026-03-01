import { cookies } from "next/headers";
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

function AccessGate() {
  return (
    <FootstepsTrail>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader active="admin" />
        <main className="max-w-md mx-auto w-full px-4 md:px-6 py-16 space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Admin Portal</p>
            <h1 className="text-2xl font-semibold tracking-tight">Enter access code</h1>
            <p className="text-sm text-muted">
              This dashboard is restricted. Contact Silin for the admin access code.
            </p>
          </div>
          <form method="GET" className="space-y-3 border border-border bg-surface p-6 rounded-2xl shadow-sm">
            <label className="text-sm text-muted space-y-1">
              Access code
              <input
                type="password"
                name="code"
                className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="••••••"
                required
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-all"
            >
              Unlock
            </button>
          </form>
        </main>
      </div>
    </FootstepsTrail>
  );
}

export default async function AdminOrgsPage({
  searchParams,
}: {
  searchParams?: { code?: string };
}) {
  const requiredCode = process.env.ADMIN_ACCESS_CODE;
  const cookieStore = cookies();
  const incomingCode = searchParams?.code;
  const storedCode = cookieStore.get("agentrail_admin")?.value;

  if (requiredCode) {
    if (incomingCode && incomingCode === requiredCode) {
      cookieStore.set("agentrail_admin", incomingCode, {
        httpOnly: true,
        sameSite: "strict",
        path: "/admin",
      });
    }

    const hasAccess = storedCode === requiredCode || incomingCode === requiredCode;
    if (!hasAccess) {
      return <AccessGate />;
    }
  }

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
