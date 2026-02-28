import { createHash } from "node:crypto";

interface HashInput {
  goal: string;
  url: string;
  timestamp: string;
  result_json: Record<string, unknown>;
}

/**
 * Deep-sort object keys so the JSON string is deterministic regardless
 * of key insertion order. This is critical because Supabase jsonb
 * reorders keys alphabetically — without sorting, a hash computed from
 * TinyFish's key order won't match one recomputed from DB data.
 */
function sortKeys(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  return Object.keys(obj as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
      return sorted;
    }, {});
}

/**
 * Construct the canonical PoA payload and return its SHA-256 hex digest.
 * Top-level key order is fixed: goal → url → timestamp → result_json.
 * result_json keys are deep-sorted for determinism.
 */
export function hashPayload({
  goal,
  url,
  timestamp,
  result_json,
}: HashInput): string {
  const payload = JSON.stringify({
    goal,
    url,
    timestamp,
    result_json: sortKeys(result_json),
  });
  return createHash("sha256").update(payload).digest("hex");
}
