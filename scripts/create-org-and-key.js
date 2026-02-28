#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomBytes, createHash } = require("node:crypto");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const orgName = process.argv[2];
const keyName = process.argv[3] ?? "default";

if (!orgName) {
  console.error("Usage: node scripts/create-org-and-key.ts <org-name> [key-name]");
  process.exit(1);
}

const slug = orgName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgError) {
    console.error("Failed to create org:", orgError.message);
    process.exit(1);
  }

  const plainKey = randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(plainKey).digest("hex");

  const { error: keyError } = await supabase.from("org_api_keys").insert({
    org_id: org.id,
    name: keyName,
    key_hash: keyHash,
    last_four: plainKey.slice(-4),
  });

  if (keyError) {
    console.error("Failed to create API key:", keyError.message);
    process.exit(1);
  }

  console.log(`Created org ${org.name} (${org.id}) with API key:`);
  console.log(plainKey);
  console.log("Store this value securely; it will not be shown again.");
}

main();
