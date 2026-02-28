import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface OrgContext {
  orgId: string;
  apiKeyId: string;
}

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { plain: string; hash: string; lastFour: string } {
  const plain = randomBytes(32).toString("hex");
  const hash = hashKey(plain);
  return { plain, hash, lastFour: plain.slice(-4) };
}

function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const rawKey = request.headers.get("x-agenttrail-key");
  return rawKey?.trim() ?? null;
}

export async function authenticateOrg(
  request: NextRequest
): Promise<OrgContext | NextResponse> {
  const key = extractApiKey(request);
  if (!key) {
    return NextResponse.json(
      { error: "Missing API key. Provide Authorization: Bearer <key>." },
      { status: 401 }
    );
  }

  const keyHash = hashKey(key);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("org_api_keys")
    .select("id, revoked, orgs:orgs(id, status)")
    .eq("key_hash", keyHash)
    .maybeSingle<{ id: string; revoked: boolean; orgs: { id: string; status: string } }>();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (data.revoked || data.orgs.status !== "active") {
    return NextResponse.json({ error: "API key inactive" }, { status: 403 });
  }

  return { orgId: data.orgs.id, apiKeyId: data.id };
}
