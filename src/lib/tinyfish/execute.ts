import { createParser, type EventSourceMessage } from "eventsource-parser";

const TINYFISH_SSE_URL = "https://agent.tinyfish.ai/v1/automation/run-sse";

export interface TinyFishResult {
  run_id: string;
  streaming_url: string;
  final_url: string;
  timestamp: string;
  result_json: Record<string, unknown>;
}

interface SSEEvent {
  type: "STARTED" | "STREAMING_URL" | "PROGRESS" | "COMPLETE" | "ERROR";
  runId: string;
  timestamp: string;
  status?: string;
  streamingUrl?: string;
  purpose?: string;
  resultJson?: Record<string, unknown>;
  error?: string;
}

/**
 * Execute a browser automation task via TinyFish SSE.
 * Resolves when the COMPLETE event arrives.
 */
export async function executeTinyFish(
  goal: string,
  url: string
): Promise<TinyFishResult> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TINYFISH_API_KEY environment variable");
  }

  const response = await fetch(TINYFISH_SSE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ goal, url }),
  });

  if (!response.ok) {
    throw new Error(
      `TinyFish API returned ${response.status}: ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("TinyFish response has no body stream");
  }

  return new Promise<TinyFishResult>((resolve, reject) => {
    let streamingUrl = "";
    let runId = "";

    const parser = createParser({
      onEvent(event: EventSourceMessage) {
        try {
          const data: SSEEvent = JSON.parse(event.data);

          if (data.type === "STARTED") {
            runId = data.runId;
          }

          if (data.type === "STREAMING_URL" && data.streamingUrl) {
            streamingUrl = data.streamingUrl;
          }

          if (data.type === "COMPLETE" && data.status === "COMPLETED") {
            const finalUrl =
              (data.resultJson?.url as string) || url;

            resolve({
              run_id: runId || data.runId,
              streaming_url: streamingUrl,
              final_url: finalUrl,
              timestamp: data.timestamp,
              result_json: data.resultJson ?? {},
            });
          }

          if (data.type === "ERROR") {
            reject(
              new Error(data.error ?? "TinyFish execution failed")
            );
          }
        } catch {
          reject(new Error("Failed to parse TinyFish SSE event"));
        }
      },
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    function read() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            reject(new Error("TinyFish stream ended without completing"));
            return;
          }
          parser.feed(decoder.decode(value, { stream: true }));
          read();
        })
        .catch(reject);
    }

    read();
  });
}
