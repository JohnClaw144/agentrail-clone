#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");
const fs = require("node:fs");

const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

if (!PGHOST || !PGUSER || !PGPASSWORD || !PGDATABASE) {
  console.error("Set PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE env vars.");
  process.exit(1);
}

const client = new Client({
  host: PGHOST,
  port: PGPORT ? Number(PGPORT) : 5432,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

async function runStatement(sql, label) {
  try {
    await client.query(sql);
    console.log(`✓ ${label}`);
  } catch (error) {
    const ignorable = new Set([
      "42710", // duplicate_object
      "42P07", // duplicate_table
      "42701", // duplicate_column
      "23505", // unique_violation
    ]);
    if (ignorable.has(error.code)) {
      console.log(`• ${label} (already exists)`);
      return;
    }
    throw error;
  }
}

async function main() {
  await client.connect();

  const schemaSql = fs.readFileSync("supabase/schema.sql", "utf8");
  const statements = schemaSql
    .replace(
      /select\s+storage\.create_bucket[\s\S]*?\);/i,
      "insert into storage.buckets (id, name, public) values ('receipts','receipts', true) on conflict (id) do nothing;"
    )
    .split(/;\s*\n/)
    .map((stmt) => stmt.trim())
    .filter(Boolean);

  // Ensure run_id column exists before main schema
  await runStatement(
    "alter table if exists public.executions add column if not exists run_id text",
    "Add run_id column"
  );
  await runStatement(
    "update public.executions set run_id = coalesce(run_id, id::text) where run_id is null",
    "Backfill run_id"
  );
  await runStatement(
    "alter table if exists public.executions alter column run_id set not null",
    "Enforce run_id not null"
  );
  await runStatement(
    "create index if not exists executions_run_id_idx on public.executions (run_id)",
    "Create run_id index"
  );

  for (const statement of statements) {
    if (!statement) continue;
    await runStatement(statement, statement.split("\n")[0].slice(0, 60));
  }

  await client.end();
}

main().catch((err) => {
  console.error("Schema apply failed:", err.message);
  process.exit(1);
});
