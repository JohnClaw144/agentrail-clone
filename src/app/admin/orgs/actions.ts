"use server";

import { randomBytes, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = {
  success?: string;
  error?: string;
  apiKey?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function generateApiKey() {
  const plainKey = randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(plainKey).digest("hex");
  return { plainKey, keyHash, lastFour: plainKey.slice(-4) };
}

export async function createOrgAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const keyLabel = formData.get("keyLabel")?.toString().trim() || "default";

  if (!name) {
    return { error: "Organization name is required" };
  }

  const supabase = createSupabaseServerClient();

  try {
    const slug = slugify(name);
    const { data: org, error } = await supabase
      .from("orgs")
      .insert({ name, slug })
      .select()
      .single();

    if (error || !org) {
      throw new Error(error?.message ?? "Failed to create org");
    }

    const { plainKey, keyHash, lastFour } = generateApiKey();
    const { error: keyError } = await supabase.from("org_api_keys").insert({
      org_id: org.id,
      name: keyLabel,
      key_hash: keyHash,
      last_four: lastFour,
    });

    if (keyError) {
      throw new Error(keyError.message);
    }

    revalidatePath("/admin/orgs");
    return {
      success: `Created ${org.name} and issued key`,
      apiKey: plainKey,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unexpected error" };
  }
}

export async function issueKeyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orgId = formData.get("orgId")?.toString();
  const keyLabel = formData.get("keyLabel")?.toString().trim() || "default";

  if (!orgId) {
    return { error: "Missing org identifier" };
  }

  const supabase = createSupabaseServerClient();

  try {
    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .select("id, name")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      throw new Error(orgError?.message ?? "Org not found");
    }

    const { plainKey, keyHash, lastFour } = generateApiKey();
    const { error: keyError } = await supabase.from("org_api_keys").insert({
      org_id: org.id,
      name: keyLabel,
      key_hash: keyHash,
      last_four: lastFour,
    });

    if (keyError) {
      throw new Error(keyError.message);
    }

    revalidatePath("/admin/orgs");
    return {
      success: `Issued key for ${org.name}`,
      apiKey: plainKey,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unexpected error" };
  }
}
