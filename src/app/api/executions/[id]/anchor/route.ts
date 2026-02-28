import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { anchorOnChain } from "@/lib/web3/anchor";
import { authenticateOrg } from "@/lib/auth/apiKey";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateOrg(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { id } = params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("executions")
    .select("id, poa_hash, org_id")
    .eq("id", id)
    .single();

  if (error || !data || data.org_id !== auth.orgId) {
    return NextResponse.json(
      { error: "Execution not found" },
      { status: 404 }
    );
  }

  anchorOnChain(id, data.poa_hash).catch((err) => {
    console.error("Manual anchor retry failed:", err);
  });

  return NextResponse.json({ status: "queued" });
}
