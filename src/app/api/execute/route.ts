import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeTinyFish } from "@/lib/tinyfish/execute";
import { hashPayload } from "@/lib/crypto/hashPayload";
import { anchorOnChain } from "@/lib/web3/anchor";
import type { Execution, ExecutionInsert } from "@/types/database";

interface ExecuteRequestBody {
  goal: string;
  url: string;
}

export async function POST(request: NextRequest) {
  // 1. Validate input
  let body: ExecuteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { goal, url } = body;
  if (!goal || !url) {
    return NextResponse.json(
      { error: "Missing required fields: goal, url" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  try {
    // 2. Execute via TinyFish SSE
    const result = await executeTinyFish(goal, url);

    // 3. Store the result JSON as proof in Supabase Storage
    const proofPayload = JSON.stringify(result.result_json, null, 2);
    const proofPath = `proofs/${result.run_id}.json`;

    await supabase.storage
      .from("receipts")
      .upload(proofPath, proofPayload, {
        contentType: "application/json",
        upsert: false,
      });

    // 4. Screenshot the target URL via thum.io
    //    TinyFish streaming URLs expire — use the target URL for a
    //    reliable visual record of the site the agent visited.
    let screenshotUrl = result.final_url;
    try {
      const screenshotTarget = result.final_url;
      const screenshotApiUrl = `https://image.thum.io/get/width/1280/png/${screenshotTarget}`;
      const screenshotRes = await fetch(screenshotApiUrl);

      if (screenshotRes.ok) {
        const screenshotBuffer = await screenshotRes.arrayBuffer();
        const screenshotPath = `screenshots/${result.run_id}.png`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(screenshotPath, screenshotBuffer, {
            contentType: "image/png",
            upsert: false,
          });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("receipts")
            .getPublicUrl(screenshotPath);
          screenshotUrl = publicUrl;
        }
      }
    } catch {
      // Screenshot capture failed — continue with streaming URL as fallback
    }

    // 5. Generate PoA hash (anchors the actual agent output, not the screenshot)
    const poaHash = hashPayload({
      goal,
      url: result.final_url,
      timestamp: result.timestamp,
      result_json: result.result_json,
    });

    // 6. Insert execution record with status: 'pending'
    const row: ExecutionInsert = {
      goal,
      target_url: result.final_url,
      screenshot_url: screenshotUrl,
      streaming_url: result.streaming_url || null,
      poa_hash: poaHash,
      poa_timestamp: result.timestamp,
      result_json: result.result_json,
      tx_hash: null,
      status: "pending",
    };

    const { data: execution, error: insertError } = await supabase
      .from("executions")
      .insert(row)
      .select()
      .single<Execution>();

    if (insertError || !execution) {
      throw new Error(
        `Database insert failed: ${insertError?.message ?? "No data returned"}`
      );
    }

    // 7. Fire-and-forget blockchain anchoring (NEVER block the response)
    anchorOnChain(execution.id, poaHash).catch((error) => {
      console.error("Background anchoring error:", error);
    });

    // 8. Return immediately with pending receipt
    return NextResponse.json({
      receipt_id: execution.id,
      status: "pending",
      poa_hash: poaHash,
      screenshot_url: screenshotUrl,
      result_json: result.result_json,
    });
  } catch (error) {
    console.error("Execution failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
