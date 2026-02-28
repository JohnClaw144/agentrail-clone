import { getPublicClient, getWalletClient } from "./client";
import { AGENT_TRAIL_ABI, CONTRACT_ADDRESS } from "./abi";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExecutionUpdate } from "@/types/database";

/**
 * Anchor a PoA hash on-chain and update the Supabase execution record.
 * This runs asynchronously — never awaited by the API response.
 */
export async function anchorOnChain(
  executionId: string,
  poaHash: string
): Promise<void> {
  const supabase = createSupabaseServerClient();

  try {
    const wallet = getWalletClient();
    const txHash = await wallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: AGENT_TRAIL_ABI,
      functionName: "storeReceipt",
      args: [poaHash],
    });

    await supabase
      .from("executions")
      .update({ tx_hash: txHash, anchor_error: null })
      .eq("id", executionId);

    const client = getPublicClient();
    await client.waitForTransactionReceipt({ hash: txHash });

    const update: ExecutionUpdate = {
      tx_hash: txHash,
      status: "completed",
      anchor_error: null,
    };
    await supabase.from("executions").update(update).eq("id", executionId);
  } catch (error) {
    console.error(`Blockchain anchor failed for ${executionId}:`, error);

    const update: ExecutionUpdate = {
      status: "failed",
      anchor_error:
        error instanceof Error ? error.message : "Unknown anchoring failure",
    };
    await supabase.from("executions").update(update).eq("id", executionId);
  }
}
