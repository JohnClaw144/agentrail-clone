import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authenticateOrg } from "@/lib/auth/apiKey";

export async function GET(request: NextRequest) {
  const auth = await authenticateOrg(request);
  if (auth instanceof Response) {
    return auth;
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("executions")
    .select("*")
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
