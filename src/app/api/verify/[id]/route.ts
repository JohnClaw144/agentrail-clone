import { NextRequest, NextResponse } from "next/server";
import { decodeEventLog } from "viem";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicClient } from "@/lib/web3/client";
import { hashPayload } from "@/lib/crypto/hashPayload";
import { AGENT_TRAIL_ABI, CONTRACT_ADDRESS } from "@/lib/web3/abi";
import type { Execution } from "@/types/database";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  // 1. Fetch the execution record
  const { data: execution, error } = await supabase
    .from("executions")
    .select("*")
    .eq("id", id)
    .single<Execution>();

  if (error || !execution) {
    return NextResponse.json(
      { error: "Execution not found" },
      { status: 404 }
    );
  }

  // 2. Re-compute the hash from stored data (triple verification)
  let recomputedHash: string | null = null;
  if (execution.poa_timestamp && execution.result_json) {
    recomputedHash = hashPayload({
      goal: execution.goal,
      url: execution.target_url,
      timestamp: execution.poa_timestamp,
      result_json: execution.result_json,
    });
  }

  // 3. Check if there's a transaction to verify
  if (!execution.tx_hash) {
    return NextResponse.json({
      verified: false,
      on_chain_hash: null,
      stored_hash: execution.poa_hash,
      recomputed_hash: recomputedHash,
      tx_hash: null,
      block_number: null,
      contract_address: null,
      chain: "Base Sepolia",
      error: "No transaction hash — blockchain anchor is still pending.",
    });
  }

  try {
    // 4. Fetch the transaction receipt and decode the event log
    const client = getPublicClient();
    const receipt = await client.getTransactionReceipt({
      hash: execution.tx_hash as `0x${string}`,
    });

    // Find the ReceiptStored event in the logs
    let onChainHash: string | null = null;

    for (const log of receipt.logs) {
      try {
        if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
          continue;
        }

        const decoded = decodeEventLog({
          abi: AGENT_TRAIL_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "ReceiptStored") {
          const args = decoded.args as { poaHash: string };
          onChainHash = args.poaHash;
          break;
        }
      } catch {
        continue;
      }
    }

    // 5. Triple comparison: on-chain === stored === recomputed
    const chainMatchesStored = onChainHash === execution.poa_hash;
    const storedMatchesRecomputed = recomputedHash
      ? recomputedHash === execution.poa_hash
      : null;
    const verified =
      chainMatchesStored && (storedMatchesRecomputed === null || storedMatchesRecomputed);

    return NextResponse.json({
      verified,
      on_chain_hash: onChainHash,
      stored_hash: execution.poa_hash,
      recomputed_hash: recomputedHash,
      tx_hash: execution.tx_hash,
      block_number: Number(receipt.blockNumber),
      contract_address: CONTRACT_ADDRESS,
      chain: "Base Sepolia",
    });
  } catch (err) {
    return NextResponse.json(
      {
        verified: false,
        on_chain_hash: null,
        stored_hash: execution.poa_hash,
        recomputed_hash: recomputedHash,
        tx_hash: execution.tx_hash,
        block_number: null,
        contract_address: null,
        chain: "Base Sepolia",
        error:
          err instanceof Error
            ? err.message
            : "Failed to verify on-chain data",
      },
      { status: 500 }
    );
  }
}
